import * as vscode from "vscode";
import throttle from "lodash.throttle";

import { Logger } from "./Logger";
import { ArgdownContentProvider } from "./ArgdownContentProvider";
import { WebviewResourceProvider } from "./util/resources";
import { Disposable } from "./util/dispose";
import * as path from "./util/path";
import {
  getVisibleLine,
  LastScrollLocation,
  TopmostLineMonitor
} from "./util/topmostLineMonitor";
import { ArgdownPreviewConfigurationManager } from "./ArgdownPreviewConfiguration";
import { isArgdownFile } from "./util/file";
import { ArgdownEngine } from "./ArgdownEngine";
import { IArgdownPreviewState } from "./IArgdownPreviewState";
import { ArgdownContributionProvider } from "./ArgdownExtensions";

export namespace PreviewViews {
  export const HTML: string = "html";
  export const DAGRE: string = "dagre";
  export const VIZJS: string = "vizjs";
}
export class PreviewDocumentVersion {
  public readonly resource: vscode.Uri;
  private readonly version: number;

  public constructor(document: vscode.TextDocument) {
    this.resource = document.uri;
    this.version = document.version;
  }

  public equals(other: PreviewDocumentVersion): boolean {
    return (
      this.resource.fsPath === other.resource.fsPath &&
      this.version === other.version
    );
  }
}
interface ArgdownPreviewDelegate {
  getTitle?(resource: vscode.Uri): string;
  getAdditionalState(): {};
  openPreviewLinkToArgdownFile(argdownLink: vscode.Uri, fragment: string): void;
}
class StartingScrollLine {
  public readonly type = "line";

  constructor(public readonly line: number) {}
}

export class StartingScrollFragment {
  public readonly type = "fragment";

  constructor(public readonly fragment: string) {}
}

type StartingScrollLocation = StartingScrollLine | StartingScrollFragment;
export class ArgdownPreview extends Disposable
  implements WebviewResourceProvider {
  public static viewType = "argdown.preview";

  public delay: number = 300;

  private readonly _resource: vscode.Uri;
  private readonly _webviewPanel: vscode.WebviewPanel;

  private throttleTimer: any;

  private line: number | undefined;
  private scrollToFragment: string | undefined;

  private firstUpdate = true;
  private currentVersion?: PreviewDocumentVersion;
  private isScrolling = false;
  private _disposed: boolean = false;
  private _state?: any;

  private readonly _fileWatchersBySrc = new Map<
    /* src: */ string,
    vscode.FileSystemWatcher
  >();
  // private readonly _unwatchedImageSchemes = new Set(['https', 'http', 'data']);

  private _currentView: string | null;
  public get currentView() {
    return this._currentView;
  }

  private readonly _onScrollEmitter = this._register(
    new vscode.EventEmitter<LastScrollLocation>()
  );
  public readonly onScroll = this._onScrollEmitter.event;
  private readonly _onDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDispose = this._onDispose.event;

  private readonly _onDidChangeViewState = this._register(
    new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>()
  );
  public readonly onDidChangeViewState = this._onDidChangeViewState.event;

  constructor(
    webview: vscode.WebviewPanel,
    currentView: string | null,
    resource: vscode.Uri,
    startingScroll: StartingScrollLocation | undefined,
    private readonly delegate: ArgdownPreviewDelegate,
    private readonly _argdownEngine: ArgdownEngine,
    private readonly _contentProvider: ArgdownContentProvider,
    private readonly _previewConfigurations: ArgdownPreviewConfigurationManager,
    private readonly _logger: Logger,
    private readonly _contributionProvider: ArgdownContributionProvider
  ) {
    super();
    this._resource = resource;
    this._webviewPanel = webview;

    switch (startingScroll?.type) {
      case "line":
        if (!isNaN(startingScroll.line!)) {
          this.line = startingScroll.line;
        }
        break;

      case "fragment":
        this.scrollToFragment = startingScroll.fragment;
        break;
    }
    this._previewConfigurations.refreshArgdownConfig(this._resource);
    this._register(
      this._contributionProvider.onContributionsChanged(() => {
        setTimeout(() => this.refresh(), 0);
      })
    );
    this._register(
      vscode.workspace.onDidChangeTextDocument(event => {
        if (this.isPreviewOf(event.document.uri)) {
          this.refresh();
        }
      })
    );
    this._register(
      vscode.workspace.onDidOpenTextDocument(document => {
        if (this.isPreviewOf(document.uri)) {
          this.refresh();
        }
      })
    );
    const watcher = this._register(
      vscode.workspace.createFileSystemWatcher(resource.fsPath)
    );
    this._register(
      watcher.onDidChange(uri => {
        if (this.isPreviewOf(uri)) {
          // Only use the file system event when VS Code does not already know about the file
          if (
            !vscode.workspace.textDocuments.some(
              doc => doc.uri.toString() !== uri.toString()
            )
          ) {
            this.refresh();
          }
        }
      })
    );
    this._register(
      this._webviewPanel.onDidChangeViewState(async () => {
        if (this._disposed) {
          return;
        }

        if (this._webviewPanel.active) {
          let document: vscode.TextDocument;
          try {
            document = await vscode.workspace.openTextDocument(this._resource);
          } catch {
            return;
          }

          if (this._disposed) {
            return;
          }

          const content = await this._contentProvider.provideHtmlContent(
            document,
            this,
            this._previewConfigurations,
            this.state
          );
          if (!this._webviewPanel.active && !this._disposed) {
            // Update the html so we can show it properly when restoring it
            this._webviewPanel.webview.html = content;
          }
        }
      })
    );

    const config = this._previewConfigurations.getConfiguration(this._resource);
    this._currentView = currentView || config.defaultView || PreviewViews.VIZJS;
    this.delay = config.minDelayBetweenUpdates;

    this._register(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("argdown.preview.lockMenu")) {
          this.updateConfiguration();
        }
      })
    );
    this._register(
      this._webviewPanel.webview.onDidReceiveMessage(async e => {
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
            vscode.commands.executeCommand(e.body.command, ...args);
            break;
          case "revealLine":
            this.onDidScrollPreview(e.body.line);
            break;
          case "didClick":
            await this.onDidClickPreview(e.body.line);
            break;
          case "didChangeView":
            await this.onDidChangeView(e.body.view);
            break;
          case "didChangeLockMenu":
            await this.onDidChangeLockMenu(e.body.lockMenu === "true");
            break;
          case "didSelectMapNode":
            await this.onDidSelectMapNode(e.body.id);
            break;
          case "didSelectCluster":
            await this.onDidSelectCluster(e.body.heading);
            break;
        }
      })
    );
    this.updatePreview();
  }
	override dispose(){
  		super.dispose();

  		this._disposed = true;

  		clearTimeout(this.throttleTimer);
  		for (const entry of this._fileWatchersBySrc.values()) {
  			entry.dispose();
  		}
  		this._fileWatchersBySrc.clear();
  	}

  public get resource(): vscode.Uri {
    return this._resource;
  }

  private async updatePreview(forceUpdate?: boolean): Promise<void> {
    clearTimeout(this.throttleTimer);
    this.throttleTimer = undefined;

    if (this._disposed) {
      return;
    }

    let document: vscode.TextDocument;
    try {
      document = await vscode.workspace.openTextDocument(this._resource);
    } catch {
      await this.showFileNotFoundError();
      return;
    }

    if (this._disposed) {
      return;
    }

    const pendingVersion = new PreviewDocumentVersion(document);
    if (!forceUpdate && this.currentVersion?.equals(pendingVersion)) {
      if (this.line) {
        this.scrollTo(this.line);
      }
      return;
    }

    const shouldReloadPage =
      forceUpdate ||
      !this.currentVersion ||
      this.currentVersion.resource.toString() !==
        pendingVersion.resource.toString();
    this.currentVersion = pendingVersion;

    try {
      let content: any;
      if (shouldReloadPage) {
        content = await this._contentProvider.provideHtmlContent(
          document,
          this,
          this._previewConfigurations,
          this.state
        );
      } else {
        const view = this._currentView || PreviewViews.VIZJS;
        content = await this._contentProvider.provideOnDidChangeTextDocumentMessage(
          view,
          document,
          this._previewConfigurations
        );
      }
      // Another call to `doUpdate` may have happened.
      // Make sure we are still updating for the correct document
      if (this.currentVersion?.equals(pendingVersion)) {
        this.updateWebviewContent(content, shouldReloadPage);
      }
    } catch (e) {
      if (e instanceof Error) {
        this._logger.log(e.message);
      }
    }
  }

  public get state() {
    if (this._state) {
      this._state = { ...this._state, ...this.delegate.getAdditionalState() };
    } else {
      this._state = {
        resource: this._resource.toString(),
        fragment: this.scrollToFragment,
        ...this.delegate.getAdditionalState(),
        vizJs: { position: {} },
        dagre: { position: {} },
        html: { line: 0 }
      };
    }
    if (this._currentView) {
      this._state.currentView = this._currentView;
    }
    if (this.line) {
      this._state!.html.line = this.line;
    }
    return this._state!;
  }
  public set state(state: any) {
    this._state = state;
  }
  private updateWebviewContent(htmlOrMessage: any, reloadPage: boolean): void {
    if (this._disposed) {
      return;
    }

    if (this.delegate.getTitle) {
      this._webviewPanel.title = this.delegate.getTitle(this._resource);
    }
    this._webviewPanel.webview.options = this.getWebviewOptions();
    this._webviewPanel.iconPath = this._contentProvider.iconPath;
    if (reloadPage) {
      this._webviewPanel.webview.html = htmlOrMessage;
    } else {
      this._webviewPanel.webview.postMessage({
        ...htmlOrMessage,
        type: "didChangeTextDocument",
        source: this._resource.toString()
      });
    }
  }
  private async showFileNotFoundError() {
    this._webviewPanel.webview.html = this._contentProvider.provideFileNotFoundContent(
      this._resource
    );
  }
  /**
   * The first call immediately refreshes the preview,
   * calls happening shortly thereafter are debounced.
   */
  public refresh(forceUpdate: boolean = false) {
    // Schedule update if none is pending
    if (!this.throttleTimer) {
      if (this.firstUpdate) {
        this.updatePreview(true);
      } else {
        this.throttleTimer = setTimeout(
          () => this.updatePreview(forceUpdate),
          this.delay
        );
      }
    }

    this.firstUpdate = false;
  }

  public updateConfiguration() {
    if (this._previewConfigurations.hasConfigurationChanged(this._resource)) {
      this._previewConfigurations.loadAndCacheConfiguration(this._resource);
      this.refresh(true);
    }
  }

  public get position(): vscode.ViewColumn | undefined {
    return this._webviewPanel.viewColumn;
  }

  public isWebviewOf(webview: vscode.WebviewPanel): boolean {
    return this._webviewPanel === webview;
  }

  public reveal(viewColumn: vscode.ViewColumn) {
    this._webviewPanel.reveal(viewColumn);
  }

  public isPreviewOf(resource: vscode.Uri): boolean {
    return this._resource.fsPath === resource.fsPath;
  }

  public postMessage(msg: any) {
    if (!this._disposed) {
      this._webviewPanel.webview.postMessage(msg);
    }
  }
  public scrollTo(topLine: number) {
    if (this._disposed) {
      return;
    }

    if (this.isScrolling) {
      this.isScrolling = false;
      return;
    }

    this._logger.log("updateForView", { argdownFile: this._resource });
    this.line = topLine;
    this.postMessage({
      type: "updateView",
      line: topLine,
      source: this._resource.toString()
    });
  }
  private getWebviewOptions(): vscode.WebviewOptions {
    return {
      enableScripts: true,
      enableForms: false,
      localResourceRoots: this.getLocalResourceRoots()
    };
  }
  private getLocalResourceRoots(): ReadonlyArray<vscode.Uri> {
    const baseRoots = Array.from(
      this._contributionProvider.contributions.previewResourceRoots
    );

    const folder = vscode.workspace.getWorkspaceFolder(this._resource);
    if (folder) {
      const workspaceRoots = vscode.workspace.workspaceFolders?.map(
        folder => folder.uri
      );
      if (workspaceRoots) {
        baseRoots.push(...workspaceRoots);
      }
    } else {
      baseRoots.push(
        this._resource.with({ path: path.dirname(this._resource.path) })
      );
    }

    return baseRoots;
  }

  private onDidScrollPreview(line: number) {
    this.line = line;
    this._onScrollEmitter.fire({ line: this.line, uri: this._resource });
    const config = this._previewConfigurations.loadAndCacheConfiguration(
      this._resource
    );
    if (!config.scrollEditorWithPreview) {
      return;
    }

    for (const editor of vscode.window.visibleTextEditors) {
      if (!this.isPreviewOf(editor.document.uri)) {
        continue;
      }

      this.isScrolling = true;
      scrollEditorToLine(line, editor);
    }
  }

  private async onDidClickPreview(line: number): Promise<void> {
    // fix #82457, find currently opened but unfocused source tab
    await vscode.commands.executeCommand("argdown.showSource");

    for (const visibleEditor of vscode.window.visibleTextEditors) {
      if (this.isPreviewOf(visibleEditor.document.uri)) {
        const editor = await vscode.window.showTextDocument(
          visibleEditor.document,
          visibleEditor.viewColumn
        );
        const position = new vscode.Position(line, 0);
        editor.selection = new vscode.Selection(position, position);
        return;
      }
    }

    await vscode.workspace
      .openTextDocument(this._resource)
      .then(vscode.window.showTextDocument)
      .then(undefined, () => {
        vscode.window.showErrorMessage(
          `Could not open ${this._resource.toString()}`
        );
      });
  }
  private async onDidChangeView(view: string) {
    if (
      view == PreviewViews.HTML ||
      view == PreviewViews.DAGRE ||
      view == PreviewViews.VIZJS
    ) {
      if (view !== this._currentView) {
        // reload argdown config on view change
        this._previewConfigurations.refreshArgdownConfig(this._resource);
        this._currentView = view;
        this.updatePreview(true);
      }
    }
  }
  private async onDidChangeLockMenu(lockMenu: boolean) {
    await vscode.workspace
      .getConfiguration("argdown", null)
      .update("preview.lockMenu", lockMenu, true);
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
      if (e instanceof Error) {
        this._logger.log(e.message);
      }
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
      if (e instanceof Error) {
        this._logger.log(e.message);
      }
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
  //#region WebviewResourceProvider

  asWebviewUri(resource: vscode.Uri) {
    return this._webviewPanel.webview.asWebviewUri(resource);
  }

  get cspSource() {
    return this._webviewPanel.webview.cspSource;
  }

  //#endregion
}

export interface PreviewSettings {
  readonly resourceColumn: vscode.ViewColumn;
  readonly previewColumn: vscode.ViewColumn;
  readonly locked: boolean;
}
export interface ManagedArgdownPreview {
  readonly resource: vscode.Uri;
  readonly resourceColumn: vscode.ViewColumn;

  readonly onDispose: vscode.Event<void>;
  readonly onDidChangeViewState: vscode.Event<
    vscode.WebviewPanelOnDidChangeViewStateEvent
  >;

  dispose(): void;

  refresh(): void;
  updateConfiguration(): void;

  matchesResource(
    otherResource: vscode.Uri,
    otherPosition: vscode.ViewColumn | undefined,
    otherLocked: boolean
  ): boolean;
}

export class StaticArgdownPreview extends Disposable
  implements ManagedArgdownPreview {
  public static readonly customEditorViewType = "argdown.preview.editor";

  public static revive(
    resource: vscode.Uri,
    webview: vscode.WebviewPanel,
    contentProvider: ArgdownContentProvider,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    topmostLineMonitor: TopmostLineMonitor,
    logger: Logger,
    contributionProvider: ArgdownContributionProvider,
    engine: ArgdownEngine,
    scrollLine?: number
  ): StaticArgdownPreview {
    return new StaticArgdownPreview(
      webview,
      resource,
      contentProvider,
      previewConfigurations,
      topmostLineMonitor,
      logger,
      contributionProvider,
      engine,
      scrollLine
    );
  }

  private readonly preview: ArgdownPreview;

  private constructor(
    private readonly _webviewPanel: vscode.WebviewPanel,
    resource: vscode.Uri,
    contentProvider: ArgdownContentProvider,
    private readonly _previewConfigurations: ArgdownPreviewConfigurationManager,
    topmostLineMonitor: TopmostLineMonitor,
    logger: Logger,
    contributionProvider: ArgdownContributionProvider,
    engine: ArgdownEngine,
    scrollLine?: number
  ) {
    super();
    const topScrollLocation = scrollLine
      ? new StartingScrollLine(scrollLine)
      : undefined;
    this.preview = this._register(
      new ArgdownPreview(
        this._webviewPanel,
        null,
        resource,
        topScrollLocation,
        {
          getAdditionalState: () => {
            return {};
          },
          openPreviewLinkToArgdownFile: (
            link: vscode.Uri,
            fragment?: string
          ) => {
            return vscode.commands.executeCommand(
              "vscode.openWith",
              link.with({
                fragment
              }),
              StaticArgdownPreview.customEditorViewType,
              this._webviewPanel.viewColumn
            );
          }
        },
        engine,
        contentProvider,
        _previewConfigurations,
        logger,
        contributionProvider
      )
    );

    this._register(
      this._webviewPanel.onDidDispose(() => {
        this.dispose();
      })
    );

    this._register(
      this._webviewPanel.onDidChangeViewState(e => {
        this._onDidChangeViewState.fire(e);
      })
    );

    this._register(
      this.preview.onScroll(scrollInfo => {
        topmostLineMonitor.setPreviousStaticEditorLine(scrollInfo);
      })
    );

    this._register(
      topmostLineMonitor.onDidChanged(event => {
        if (this.preview.isPreviewOf(event.resource)) {
          this.preview.scrollTo(event.line);
        }
      })
    );
  }

  private readonly _onDispose = this._register(new vscode.EventEmitter<void>());
  public readonly onDispose = this._onDispose.event;

  private readonly _onDidChangeViewState = this._register(
    new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>()
  );
  public readonly onDidChangeViewState = this._onDidChangeViewState.event;

  override dispose() {
  	this._onDispose.fire();
  	super.dispose();
  }

  public matchesResource(
    _otherResource: vscode.Uri,
    _otherPosition: vscode.ViewColumn | undefined,
    _otherLocked: boolean
  ): boolean {
    return false;
  }

  public refresh() {
    this.preview.refresh(true);
  }

  public updateConfiguration() {
    if (
      this._previewConfigurations.hasConfigurationChanged(this.preview.resource)
    ) {
      this.refresh();
    }
  }

  public get resource() {
    return this.preview.resource;
  }

  public get resourceColumn() {
    return this._webviewPanel.viewColumn || vscode.ViewColumn.One;
  }
}

interface DynamicPreviewInput extends Partial<IArgdownPreviewState> {
  readonly resource: vscode.Uri;
  readonly resourceColumn: vscode.ViewColumn;
  readonly locked: boolean;
  readonly line?: number;
}

/**
 * A
 */
export class DynamicArgdownPreview extends Disposable
  implements ManagedArgdownPreview {
  public static readonly viewType = "argdown.preview";

  private readonly _resourceColumn: vscode.ViewColumn;
  private _locked: boolean;

  private readonly _webviewPanel: vscode.WebviewPanel;
  private _preview: ArgdownPreview;
  private throttledSelectionSync: (selection: vscode.Selection) => void;

  public static revive(
    input: DynamicPreviewInput,
    webview: vscode.WebviewPanel,
    contentProvider: ArgdownContentProvider,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    logger: Logger,
    topmostLineMonitor: TopmostLineMonitor,
    contributionProvider: ArgdownContributionProvider,
    engine: ArgdownEngine
  ): DynamicArgdownPreview {
    webview.iconPath = contentProvider.iconPath;

    return new DynamicArgdownPreview(
      webview,
      input,
      contentProvider,
      previewConfigurations,
      logger,
      topmostLineMonitor,
      contributionProvider,
      engine
    );
  }

  public static create(
    input: DynamicPreviewInput,
    previewColumn: vscode.ViewColumn,
    contentProvider: ArgdownContentProvider,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    logger: Logger,
    topmostLineMonitor: TopmostLineMonitor,
    contributionProvider: ArgdownContributionProvider,
    engine: ArgdownEngine
  ): DynamicArgdownPreview {
    const webview = vscode.window.createWebviewPanel(
      DynamicArgdownPreview.viewType,
      DynamicArgdownPreview.getPreviewTitle(input.resource, input.locked),
      previewColumn,
      { enableFindWidget: true }
    );

    webview.iconPath = contentProvider.iconPath;

    return new DynamicArgdownPreview(
      webview,
      input,
      contentProvider,
      previewConfigurations,
      logger,
      topmostLineMonitor,
      contributionProvider,
      engine
    );
  }

  private constructor(
    webview: vscode.WebviewPanel,
    input: DynamicPreviewInput,
    private readonly _contentProvider: ArgdownContentProvider,
    private readonly _previewConfigurations: ArgdownPreviewConfigurationManager,
    private readonly _logger: Logger,
    private readonly _topmostLineMonitor: TopmostLineMonitor,
    private readonly _contributionProvider: ArgdownContributionProvider,
    private readonly _engine: ArgdownEngine
  ) {
    super();

    this._webviewPanel = webview;

    this._resourceColumn = input.resourceColumn;
    this._locked = input.locked;

    this._preview = this.createPreview(
      input.resource,
      input.currentView ? input.currentView : null,
      typeof input.line === "number"
        ? new StartingScrollLine(input.line)
        : undefined
    );

    this._register(
      webview.onDidDispose(() => {
        this.dispose();
      })
    );
    this.throttledSelectionSync = throttle(
      async (selection: vscode.Selection) => {
        const resource = this._preview.resource;
        const config = this._previewConfigurations.getConfiguration(resource);
        const document = await vscode.workspace.openTextDocument(resource);
        const id: string = await this._engine.getMapNodeId(
          document,
          config,
          selection.active.line,
          selection.active.character
        );
        if (id) {
          this._preview.postMessage({
            type: "didSelectMapNode",
            source: resource.toString(),
            id
          });
        }
      },
      this._preview.delay
    );
    this._register(
      this._webviewPanel.onDidChangeViewState(e => {
        this._onDidChangeViewStateEmitter.fire(e);
      })
    );

    this._register(
      this._topmostLineMonitor.onDidChanged(event => {
        if (this._preview.isPreviewOf(event.resource)) {
          this._preview.scrollTo(event.line);
        }
      })
    );

    this._register(
      vscode.window.onDidChangeTextEditorSelection(async event => {
        if (this._preview.isPreviewOf(event.textEditor.document.uri)) {
          this._preview.postMessage({
            type: "onDidChangeTextEditorSelection",
            line: event.selections[0].active.line,
            character: event.selections[0].active.character,
            source: this._preview.resource.toString()
          });
          if (this._preview.currentView !== PreviewViews.HTML) {
            await this.throttledSelectionSync(event.selections[0]);
          }
        }
      })
    );
    this._register(
      vscode.window.onDidChangeActiveTextEditor(editor => {
        // Only allow previewing normal text editors which have a viewColumn: See #101514
        if (typeof editor?.viewColumn === "undefined") {
          return;
        }

        if (
          isArgdownFile(editor.document) &&
          !this._locked &&
          !this._preview.isPreviewOf(editor.document.uri)
        ) {
          const line = getVisibleLine(editor);
          this.update(
            editor.document.uri,
            line ? new StartingScrollLine(line) : undefined
          );
        }
      })
    );
  }

  private readonly _onDisposeEmitter = this._register(
    new vscode.EventEmitter<void>()
  );
  public readonly onDispose = this._onDisposeEmitter.event;

  private readonly _onDidChangeViewStateEmitter = this._register(
    new vscode.EventEmitter<vscode.WebviewPanelOnDidChangeViewStateEvent>()
  );
  public readonly onDidChangeViewState = this._onDidChangeViewStateEmitter
    .event;

  override dispose() {
  	this._preview.dispose();
  	this._webviewPanel.dispose();
  	this._onDisposeEmitter.fire();
  	this._onDisposeEmitter.dispose();
  	super.dispose();
  }

  public get resource() {
    return this._preview.resource;
  }

  public get resourceColumn() {
    return this._resourceColumn;
  }

  public reveal(viewColumn: vscode.ViewColumn) {
    this._webviewPanel.reveal(viewColumn);
  }

  public refresh() {
    this._preview.refresh(true);
  }

  public updateConfiguration() {
    if (
      this._previewConfigurations.hasConfigurationChanged(
        this._preview.resource
      )
    ) {
      this.refresh();
    }
  }

  public update(
    newResource: vscode.Uri,
    scrollLocation?: StartingScrollLocation
  ) {
    if (this._preview.isPreviewOf(newResource)) {
      switch (scrollLocation?.type) {
        case "line":
          this._preview.scrollTo(scrollLocation.line);
          return;

        case "fragment":
          // Workaround. For fragments, just reload the entire preview
          break;

        default:
          return;
      }
    }

    this._preview.dispose();
    this._preview = this.createPreview(newResource, null, scrollLocation);
  }

  public toggleLock() {
    this._locked = !this._locked;
    this._webviewPanel.title = DynamicArgdownPreview.getPreviewTitle(
      this._preview.resource,
      this._locked
    );
  }

  private static getPreviewTitle(
    resource: vscode.Uri,
    locked: boolean
  ): string {
    return locked
      ? `[Preview] ${path.basename(resource.fsPath)}`
      : `'Preview ${path.basename(resource.fsPath)}`;
  }

  public get position(): vscode.ViewColumn | undefined {
    return this._webviewPanel.viewColumn;
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
      return otherLocked && this._preview.isPreviewOf(otherResource);
    } else {
      return !otherLocked;
    }
  }

  public matches(otherPreview: DynamicArgdownPreview): boolean {
    return this.matchesResource(
      otherPreview._preview.resource,
      otherPreview.position,
      otherPreview._locked
    );
  }

  private createPreview(
    resource: vscode.Uri,
    currentView: string | null,
    startingScroll?: StartingScrollLocation
  ): ArgdownPreview {
    return new ArgdownPreview(
      this._webviewPanel,
      currentView,
      resource,
      startingScroll,
      {
        getTitle: resource =>
          DynamicArgdownPreview.getPreviewTitle(resource, this._locked),
        getAdditionalState: () => {
          return {
            resourceColumn: this.resourceColumn,
            locked: this._locked
          };
        },
        openPreviewLinkToArgdownFile: (link: vscode.Uri, fragment?: string) => {
          this.update(
            link,
            fragment ? new StartingScrollFragment(fragment) : undefined
          );
        }
      },
      this._engine,
      this._contentProvider,
      this._previewConfigurations,
      this._logger,
      this._contributionProvider
    );
  }
}
/**
 * Change the top-most visible line of `editor` to be at `line`
 */
export function scrollEditorToLine(line: number, editor: vscode.TextEditor) {
  const sourceLine = Math.floor(line);
  const fraction = line - sourceLine;
  const text = editor.document.lineAt(sourceLine).text;
  const start = Math.floor(fraction * text.length);
  editor.revealRange(
    new vscode.Range(sourceLine, start, sourceLine + 1, 0),
    vscode.TextEditorRevealType.AtTop
  );
}
