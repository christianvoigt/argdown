import * as vscode from "vscode";
import { Logger } from "./Logger";
import { ArgdownExtensionContributions } from "./ArgdownExtensionContributions";
import { disposeAll } from "./util/dispose";
import { ArgdownFileTopmostLineMonitor } from "./util/topmostLineMonitor";
import { ArgdownPreview, PreviewSettings } from "./ArgdownPreview";
import { ArgdownPreviewConfigurationManager } from "./ArgdownPreviewConfiguration";
import { ArgdownContentProvider } from "./ArgdownContentProvider";
import { ArgdownEngine } from "./ArgdownEngine";

export class ArgdownPreviewManager
// WebviewPanelSerializer is still a proposed api. Extensions can not be published if they use parts of the proposed api
// So we have to wait until this becomes part of the adopted api.
//implements vscode.WebviewPanelSerializer
{
  private static readonly argdownPreviewActiveContextKey =
    "argdownPreviewFocus";

  private readonly topmostLineMonitor = new ArgdownFileTopmostLineMonitor();
  private readonly previewConfigurations = new ArgdownPreviewConfigurationManager(
    this.argdownEngine
  );
  private readonly previews: ArgdownPreview[] = [];
  private activePreview: ArgdownPreview | undefined = undefined;
  private readonly disposables: vscode.Disposable[] = [];

  public constructor(
    private readonly contentProvider: ArgdownContentProvider,
    private readonly logger: Logger,
    private readonly contributions: ArgdownExtensionContributions,
    private readonly argdownEngine: ArgdownEngine
  ) {
    //this.disposables.push(vscode.window.registerWebviewPanelSerializer(ArgdownPreview.viewType, this));
  }

  public dispose(): void {
    disposeAll(this.disposables);
    disposeAll(this.previews);
  }

  public refresh() {
    for (const preview of this.previews) {
      preview.refresh();
    }
  }

  public updateConfiguration() {
    for (const preview of this.previews) {
      preview.updateConfiguration();
    }
  }

  public preview(resource: vscode.Uri, previewSettings: PreviewSettings): void {
    let preview = this.getExistingPreview(resource, previewSettings);
    if (preview) {
      this.logger.log("Manager reveals existing preview...");
      preview.reveal(previewSettings.previewColumn);
    } else {
      this.logger.log("Manager creates new preview...");
      preview = this.createNewPreview(resource, previewSettings);
    }

    preview.update(resource);
  }

  public get activePreviewResource() {
    return this.activePreview && this.activePreview.resource;
  }

  public toggleLock() {
    const preview = this.activePreview;
    if (preview) {
      preview.toggleLock();

      // Close any previews that are now redundant, such as having two dynamic previews in the same editor group
      for (const otherPreview of this.previews) {
        if (otherPreview !== preview && preview.matches(otherPreview)) {
          otherPreview.dispose();
        }
      }
    }
  }

  public async deserializeWebviewPanel(
    webview: vscode.WebviewPanel,
    state: any
  ): Promise<void> {
    const preview = await ArgdownPreview.revive(
      webview,
      state,
      this.contentProvider,
      this.argdownEngine,
      this.previewConfigurations,
      this.logger,
      this.topmostLineMonitor
    );

    this.registerPreview(preview);
  }

  public async serializeWebviewPanel(
    webview: vscode.WebviewPanel
  ): Promise<any> {
    const preview = this.previews.find(preview => preview.isWebviewOf(webview));
    return preview ? preview.state : undefined;
  }

  private getExistingPreview(
    resource: vscode.Uri,
    previewSettings: PreviewSettings
  ): ArgdownPreview | undefined {
    return this.previews.find(preview =>
      preview.matchesResource(
        resource,
        previewSettings.previewColumn,
        previewSettings.locked
      )
    );
  }

  private createNewPreview(
    resource: vscode.Uri,
    previewSettings: PreviewSettings
  ): ArgdownPreview {
    const preview = ArgdownPreview.create(
      resource,
      previewSettings.previewColumn,
      previewSettings.locked,
      this.contentProvider,
      this.argdownEngine,
      this.previewConfigurations,
      this.logger,
      this.topmostLineMonitor,
      this.contributions
    );

    return this.registerPreview(preview);
  }

  private registerPreview(preview: ArgdownPreview): ArgdownPreview {
    this.previews.push(preview);

    preview.onDispose(() => {
      const existing = this.previews.indexOf(preview!);
      if (existing >= 0) {
        this.previews.splice(existing, 1);
      }
    });

    preview.onDidChangeViewState(({ webviewPanel }) => {
      disposeAll(
        this.previews.filter(
          otherPreview =>
            preview !== otherPreview && preview!.matches(otherPreview)
        )
      );

      vscode.commands.executeCommand(
        "setContext",
        ArgdownPreviewManager.argdownPreviewActiveContextKey,
        webviewPanel.visible
      );
      this.activePreview = webviewPanel.visible ? preview : undefined;
    });

    return preview;
  }
}
