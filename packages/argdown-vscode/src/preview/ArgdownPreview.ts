import * as vscode from "vscode";
import * as path from "path";
import throttle = require("lodash.throttle");

import { Logger } from "./Logger";
import { ArgdownContentProvider } from "./ArgdownContentProvider";
import { disposeAll } from "./util/dispose";

import {
  getVisibleLine,
  ArgdownFileTopmostLineMonitor
} from "./util/topmostLineMonitor";
import { ArgdownPreviewConfigurationManager } from "./ArgdownPreviewConfiguration";
import { ArgdownExtensionContributions } from "./ArgdownExtensionContributions";
import { isArgdownFile } from "./util/file";
import { ArgdownEngine } from "./ArgdownEngine";

export namespace PreviewViews {
  export const HTML: string = "html";
  export const DAGRE: string = "dagre";
  export const VIZJS: string = "vizjs";
}

export class ArgdownPreview {
  public static viewType = "argdown.preview";

  private _resource: vscode.Uri;
  private _locked: boolean;

  private readonly editor: vscode.WebviewPanel;
  private throttleTimer: any;
  private line: number | undefined = undefined;
  private readonly disposables: vscode.Disposable[] = [];
  private firstUpdate = true;
  private currentVersion?: { resource: vscode.Uri; version: number };
  private forceUpdate = false;
  private isScrolling = false;
  private _disposed: boolean = false;
  private _stateStore: { [key: string]: any } = {};
  private throttledSendDidChangeTextDocumentMessage: () => void;
  private throttledSelectionSync: (selection: vscode.Selection) => void;

  public static async revive(
    webview: vscode.WebviewPanel,
    state: any,
    contentProvider: ArgdownContentProvider,
    argdownEngine: ArgdownEngine,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    logger: Logger,
    topmostLineMonitor: ArgdownFileTopmostLineMonitor
  ): Promise<ArgdownPreview> {
    const resource = vscode.Uri.parse(state.resource);
    const locked = state.locked;
    const line = state.line;

    const preview = new ArgdownPreview(
      webview,
      resource,
      locked,
      contentProvider,
      argdownEngine,
      previewConfigurations,
      logger,
      topmostLineMonitor
    );

    if (!isNaN(line)) {
      preview.line = line;
    }
    await preview.doUpdate();
    return preview;
  }

  public static create(
    resource: vscode.Uri,
    previewColumn: vscode.ViewColumn,
    locked: boolean,
    contentProvider: ArgdownContentProvider,
    argdownEngine: ArgdownEngine,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    logger: Logger,
    topmostLineMonitor: ArgdownFileTopmostLineMonitor,
    contributions: ArgdownExtensionContributions
  ): ArgdownPreview {
    const webview = vscode.window.createWebviewPanel(
      ArgdownPreview.viewType,
      ArgdownPreview.getPreviewTitle(resource, locked),
      previewColumn,
      {
        enableScripts: true,
        enableCommandUris: true,
        enableFindWidget: true,
        localResourceRoots: ArgdownPreview.getLocalResourceRoots(
          resource,
          contributions
        )
      }
    );

    return new ArgdownPreview(
      webview,
      resource,
      locked,
      contentProvider,
      argdownEngine,
      previewConfigurations,
      logger,
      topmostLineMonitor
    );
  }

  private constructor(
    webview: vscode.WebviewPanel,
    resource: vscode.Uri,
    locked: boolean,
    private readonly _contentProvider: ArgdownContentProvider,
    private readonly _argdownEngine: ArgdownEngine,
    private readonly _previewConfigurations: ArgdownPreviewConfigurationManager,
    private readonly _logger: Logger,
    topmostLineMonitor: ArgdownFileTopmostLineMonitor
  ) {
    this._resource = resource;
    this._locked = locked;
    this.editor = webview;
    this._previewConfigurations.refreshArgdownConfig(this._resource);

    this.throttledSelectionSync = throttle(
      async (selection: vscode.Selection) => {
        const resource = this._resource;
        const config = this._previewConfigurations.getConfiguration(resource);
        const document = await vscode.workspace.openTextDocument(resource);
        const id: string = await this._argdownEngine.getMapNodeId(
          document,
          config,
          selection.active.line,
          selection.active.character
        );
        if (id) {
          this.postMessage({
            type: "didSelectMapNode",
            source: resource.toString(),
            id
          });
        }
      },
      300
    );

    this.throttledSendDidChangeTextDocumentMessage = throttle(async () => {
      const resource = this._resource;
      const document = await vscode.workspace.openTextDocument(resource);
      this.currentVersion = { resource, version: document.version };
      const msg = await this._contentProvider.provideOnDidChangeTextDocumentMessage(
        document,
        this._previewConfigurations
        // , this.line
      );
      msg.type = "didChangeTextDocument";
      msg.source = resource.toString();
      this.postMessage(msg);
    }, 300);

    this.editor.onDidDispose(
      () => {
        this.dispose();
      },
      null,
      this.disposables
    );

    this.editor.onDidChangeViewState(
      e => {
        this._onDidChangeViewStateEmitter.fire(e);
      },
      null,
      this.disposables
    );

    this.editor.webview.onDidReceiveMessage(
      e => {
        if (e.source !== this._resource.toString()) {
          return;
        }
        switch (e.type) {
          case "command":
            const args = e.body.args;
            // Swap Uri for string, if first arg is our resource (needed for export commands)
            if (
              args &&
              args.length > 0 &&
              args[0] === this._resource.toString()
            ) {
              args[0] = this._resource;
            }
            if (e.body.command === "argdown.exportContentToDagreSvg") {
              this._logger.log("exportDocumentToDagreSvg: " + args[1]);
            }
            vscode.commands.executeCommand(e.body.command, ...args);
            break;

          case "revealLine":
            this.onDidScrollPreview(e.body.line);
            break;

          case "didClick":
            this.onDidClickPreview(e.body.line);
            break;
          case "didChangeView":
            this.onDidChangeView(e.body.view);
            break;
          case "didChangeLockMenu":
            this.onDidChangeLockMenu(e.body.lockMenu == "true");
            break;
          case "didChangeZoom":
            this.onDidChangeZoom(e.body.x, e.body.y, e.body.scale);
            break;
          case "didSelectMapNode":
            this.onDidSelectMapNode(e.body.id);
            break;
          case "didSelectCluster":
            this.onDidSelectCluster(e.body.heading);
            break;
        }
      },
      null,
      this.disposables
    );

    vscode.workspace.onDidChangeTextDocument(
      event => {
        if (this.isPreviewOf(event.document.uri)) {
          this.refresh(false);
        }
      },
      null,
      this.disposables
    );

    topmostLineMonitor.onDidChangeTopmostLine(
      event => {
        if (this.isPreviewOf(event.resource)) {
          this.updateForView(event.resource, event.line);
        }
      },
      null,
      this.disposables
    );

    vscode.window.onDidChangeTextEditorSelection(
      async event => {
        if (this.isPreviewOf(event.textEditor.document.uri)) {
          this.postMessage({
            type: "onDidChangeTextEditorSelection",
            line: event.selections[0].active.line,
            character: event.selections[0].active.character,
            source: this.resource.toString()
          });
          const config = this._previewConfigurations.getConfiguration(
            this._resource
          );
          if (config && config.view !== PreviewViews.HTML) {
            await this.throttledSelectionSync(event.selections[0]);
          }
        }
      },
      null,
      this.disposables
    );

    vscode.window.onDidChangeActiveTextEditor(
      editor => {
        if (editor && isArgdownFile(editor.document) && !this._locked) {
          this.update(editor.document.uri);
        }
      },
      null,
      this.disposables
    );
  }

  private readonly _onDisposeEmitter = new vscode.EventEmitter<void>();
  public readonly onDispose = this._onDisposeEmitter.event;

  private readonly _onDidChangeViewStateEmitter = new vscode.EventEmitter<
    vscode.WebviewPanelOnDidChangeViewStateEvent
  >();
  public readonly onDidChangeViewState = this._onDidChangeViewStateEmitter
    .event;

  public get resource(): vscode.Uri {
    return this._resource;
  }

  public get state() {
    return {
      resource: this.resource.toString(),
      locked: this._locked,
      line: this.line
    };
  }

  public dispose() {
    if (this._disposed) {
      return;
    }

    this._disposed = true;
    this._onDisposeEmitter.fire();

    this._onDisposeEmitter.dispose();
    this._onDidChangeViewStateEmitter.dispose();
    this.editor.dispose();

    disposeAll(this.disposables);
  }

  public update(resource: vscode.Uri) {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === resource.fsPath) {
      this.line = getVisibleLine(editor);
    }

    // If we have changed resources, cancel any pending updates
    const isResourceChange = resource.fsPath !== this._resource.fsPath;
    if (isResourceChange) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = undefined;
    }

    this._resource = resource;

    // Schedule update if none is pending
    if (!this.throttleTimer) {
      if (isResourceChange || this.firstUpdate) {
        this.doUpdate();
      } else {
        this.throttleTimer = setTimeout(() => this.doUpdate(), 300);
      }
    }

    this.firstUpdate = false;
  }

  public refresh(forceReload: boolean = true) {
    const config = this._previewConfigurations.loadAndCacheConfiguration(
      this._resource
    );
    if (forceReload || config.view === PreviewViews.HTML) {
      this.forceUpdate = true;
      this.update(this._resource);
    } else {
      this.throttledSendDidChangeTextDocumentMessage();
    }
  }

  public updateConfiguration() {
    if (this._previewConfigurations.hasConfigurationChanged(this._resource)) {
      this.refresh(true);
    }
  }

  public get position(): vscode.ViewColumn | undefined {
    return this.editor.viewColumn;
  }

  public isWebviewOf(webview: vscode.WebviewPanel): boolean {
    return this.editor === webview;
  }

  public matchesResource(
    otherResource: vscode.Uri,
    otherPosition: vscode.ViewColumn | undefined,
    otherLocked: boolean
  ): boolean {
    if (this.position !== otherPosition) {
      return false;
    }

    if (this._locked) {
      return otherLocked && this.isPreviewOf(otherResource);
    } else {
      return !otherLocked;
    }
  }

  public matches(otherPreview: ArgdownPreview): boolean {
    return this.matchesResource(
      otherPreview._resource,
      otherPreview.position,
      otherPreview._locked
    );
  }

  public reveal(viewColumn: vscode.ViewColumn) {
    this.editor.reveal(viewColumn);
  }

  public toggleLock() {
    this._locked = !this._locked;
    this.editor.title = ArgdownPreview.getPreviewTitle(
      this._resource,
      this._locked
    );
  }

  private isPreviewOf(resource: vscode.Uri): boolean {
    return this._resource.fsPath === resource.fsPath;
  }

  private static getPreviewTitle(
    resource: vscode.Uri,
    locked: boolean
  ): string {
    const basename = path.basename(resource.fsPath);
    return locked ? `[Preview] ${basename}` : `Preview ${basename}`;
  }

  private updateForView(resource: vscode.Uri, topLine: number | undefined) {
    if (!this.isPreviewOf(resource)) {
      return;
    }

    if (this.isScrolling) {
      this.isScrolling = false;
      return;
    }

    if (typeof topLine === "number") {
      this._logger.log("updateForView", { argdownFile: resource });
      this.line = topLine;
      this.postMessage({
        type: "updateView",
        line: topLine,
        source: resource.toString()
      });
    }
  }

  private postMessage(msg: any) {
    if (!this._disposed) {
      this.editor.webview.postMessage(msg);
    }
  }

  private async doUpdate(): Promise<void> {
    const resource = this._resource;

    clearTimeout(this.throttleTimer);
    this.throttleTimer = undefined;

    const document = await vscode.workspace.openTextDocument(resource);
    if (
      !this.forceUpdate &&
      this.currentVersion &&
      this.currentVersion.resource.fsPath === resource.fsPath &&
      this.currentVersion.version === document.version
    ) {
      if (this.line) {
        this.updateForView(resource, this.line);
      }
      return;
    }
    this.forceUpdate = false;

    this.currentVersion = { resource, version: document.version };
    const content = await this._contentProvider.provideHtmlContent(
      document,
      this._previewConfigurations,
      this.line,
      this._stateStore
    );
    const config = this._previewConfigurations.getConfiguration(this._resource);
    this._stateStore[config.view] = this._stateStore[config.view] || {};
    this._stateStore[config.view].didInitiate = true;
    if (this._resource === resource) {
      this.editor.title = ArgdownPreview.getPreviewTitle(
        this._resource,
        this._locked
      );
      this.editor.webview.html = content;
    }
  }

  private static getLocalResourceRoots(
    resource: vscode.Uri,
    contributions: ArgdownExtensionContributions
  ): vscode.Uri[] {
    const baseRoots = contributions.previewResourceRoots;

    const folder = vscode.workspace.getWorkspaceFolder(resource);
    if (folder) {
      return baseRoots.concat(folder.uri);
    }

    if (!resource.scheme || resource.scheme === "file") {
      return baseRoots.concat(vscode.Uri.file(path.dirname(resource.fsPath)));
    }

    return baseRoots;
  }

  private onDidScrollPreview(line: number) {
    this.line = line;
    for (const editor of vscode.window.visibleTextEditors) {
      if (!this.isPreviewOf(editor.document.uri)) {
        continue;
      }

      this.isScrolling = true;
      const sourceLine = Math.floor(line);
      const fraction = line - sourceLine;
      const text = editor.document.lineAt(sourceLine).text;
      const start = Math.floor(fraction * text.length);
      editor.revealRange(
        new vscode.Range(sourceLine, start, sourceLine + 1, 0),
        vscode.TextEditorRevealType.AtTop
      );
    }
  }

  private async onDidClickPreview(line: number): Promise<void> {
    for (const visibleEditor of vscode.window.visibleTextEditors) {
      if (this.isPreviewOf(visibleEditor.document.uri)) {
        const editor = await vscode.window.showTextDocument(
          visibleEditor.document,
          visibleEditor.viewColumn
        );
        const position = new vscode.Position(line - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        return;
      }
    }

    vscode.workspace
      .openTextDocument(this._resource)
      .then(vscode.window.showTextDocument);
  }
  private async onDidChangeView(view: string) {
    if (
      view == PreviewViews.HTML ||
      view == PreviewViews.DAGRE ||
      view == PreviewViews.VIZJS
    ) {
      // reload argdown config on view change
      this._previewConfigurations.refreshArgdownConfig(this._resource);
      vscode.workspace
        .getConfiguration("argdown")
        .update("preview.view", view, true);
    }
  }
  private onDidChangeLockMenu(lockMenu: boolean) {
    this._logger.log("received didChangeLockMenu: " + lockMenu);
    vscode.workspace
      .getConfiguration("argdown")
      .update("preview.lockMenu", lockMenu, true);
  }
  private onDidChangeZoom(x: number, y: number, scale: number) {
    const config = this._previewConfigurations.getConfiguration(this._resource);
    if (config.view === PreviewViews.DAGRE) {
      if (!this._stateStore[PreviewViews.DAGRE]) {
        this._stateStore[PreviewViews.DAGRE] = {};
      }
      const dagreStore = this._stateStore[PreviewViews.DAGRE];
      dagreStore.scale = scale;
      dagreStore.x = x;
      dagreStore.y = y;
    } else if (config.view === PreviewViews.VIZJS) {
      if (!this._stateStore[PreviewViews.VIZJS]) {
        this._stateStore[PreviewViews.VIZJS] = {};
      }
      const vizjsStore = this._stateStore[PreviewViews.VIZJS];
      vizjsStore.scale = scale;
      vizjsStore.x = x;
      vizjsStore.y = y;
    }
  }
  private async onDidSelectMapNode(id: string) {
    const resource = this._resource;
    const document = await vscode.workspace.openTextDocument(resource);
    const config = this._previewConfigurations.getConfiguration(this._resource);
    try {
      const range = await this._argdownEngine.getRangeOfMapNode(
        document,
        config,
        id
      );
      this.jumpToRange(range);
    } catch (e) {
      this._logger.log(e.stack);
    }
  }
  private async onDidSelectCluster(headingText: string) {
    const resource = this._resource;
    const document = await vscode.workspace.openTextDocument(resource);
    const config = this._previewConfigurations.getConfiguration(this._resource);
    try {
      const range = await this._argdownEngine.getRangeOfHeading(
        document,
        config,
        headingText
      );
      this.jumpToRange(range);
    } catch (e) {
      this._logger.log(e.stack);
    }
  }
  private async jumpToRange(range: vscode.Range): Promise<void> {
    for (const visibleEditor of vscode.window.visibleTextEditors) {
      if (this.isPreviewOf(visibleEditor.document.uri)) {
        const editor = await vscode.window.showTextDocument(
          visibleEditor.document,
          visibleEditor.viewColumn
        );
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range);
        return;
      }
    }

    vscode.workspace
      .openTextDocument(this._resource)
      .then(vscode.window.showTextDocument);
  }
  public refreshArgdownConfig(): void {
    this._previewConfigurations.refreshArgdownConfig(this._resource);
    this.refresh(false);
  }
}

export interface PreviewSettings {
  readonly resourceColumn: vscode.ViewColumn;
  readonly previewColumn: vscode.ViewColumn;
  readonly locked: boolean;
}
