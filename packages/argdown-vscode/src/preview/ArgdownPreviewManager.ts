import * as vscode from "vscode";
import { Logger } from "./Logger";
import { Disposable, disposeAll } from "./util/dispose";
import { TopmostLineMonitor } from "./util/topmostLineMonitor";
import { DynamicArgdownPreview, ManagedArgdownPreview, scrollEditorToLine, StartingScrollFragment, StaticArgdownPreview } from "./ArgdownPreview";
import { ArgdownPreviewConfigurationManager } from "./ArgdownPreviewConfiguration";
import { ArgdownContentProvider } from "./ArgdownContentProvider";
import { ArgdownEngine } from "./ArgdownEngine";
import { ArgdownContributionProvider } from "./ArgdownExtensions";
import { isArgdownFile } from "./util/file";

export interface DynamicPreviewSettings {
  readonly resourceColumn: vscode.ViewColumn;
  readonly previewColumn: vscode.ViewColumn;
  readonly locked: boolean;
}
class PreviewStore<T extends ManagedArgdownPreview> extends Disposable {

	private readonly _previews = new Set<T>();

	public override dispose(): void {
		super.dispose();
		for (const preview of this._previews) {
			preview.dispose();
		}
		this._previews.clear();
	}

	[Symbol.iterator](): Iterator<T> {
		return this._previews[Symbol.iterator]();
	}

	public get(resource: vscode.Uri, previewSettings: DynamicPreviewSettings): T | undefined {
		for (const preview of this._previews) {
			if (preview.matchesResource(resource, previewSettings.previewColumn, previewSettings.locked)) {
				return preview;
			}
		}
		return undefined;
	}

	public add(preview: T) {
		this._previews.add(preview);
	}

	public delete(preview: T) {
		this._previews.delete(preview);
	}
}
export class ArgdownPreviewManager extends Disposable implements vscode.WebviewPanelSerializer, vscode.CustomTextEditorProvider {
	private static readonly markdownPreviewActiveContextKey = 'markdownPreviewFocus';

	private readonly _topmostLineMonitor = new TopmostLineMonitor();
	private readonly _previewConfigurations:ArgdownPreviewConfigurationManager;

	private readonly _dynamicPreviews = this._register(new PreviewStore<DynamicArgdownPreview>());
	private readonly _staticPreviews = this._register(new PreviewStore<StaticArgdownPreview>());

	private _activePreview: ManagedArgdownPreview | undefined = undefined;

	public constructor(
		private readonly _contentProvider: ArgdownContentProvider,
		private readonly _logger: Logger,
		private readonly _contributions: ArgdownContributionProvider,
		private readonly _engine: ArgdownEngine,
	) {
		super();
    this._previewConfigurations =  new ArgdownPreviewConfigurationManager(_engine);
		this._register(vscode.window.registerWebviewPanelSerializer(DynamicArgdownPreview.viewType, this));
		this._register(vscode.window.registerCustomEditorProvider(StaticArgdownPreview.customEditorViewType, this, {
			webviewOptions: { enableFindWidget: true }
		}));

		this._register(vscode.window.onDidChangeActiveTextEditor(textEditor => {
			// When at a markdown file, apply existing scroll settings
			if (textEditor?.document && isArgdownFile(textEditor.document)) {
				const line = this._topmostLineMonitor.getPreviousStaticEditorLineByUri(textEditor.document.uri);
				if (typeof line === 'number') {
					scrollEditorToLine(line, textEditor);
				}
			}
		}));
	}

	public refresh() {
		for (const preview of this._dynamicPreviews) {
			preview.refresh();
		}
		for (const preview of this._staticPreviews) {
			preview.refresh();
		}
	}

	public updateConfiguration() {
		for (const preview of this._dynamicPreviews) {
			preview.updateConfiguration();
		}
		for (const preview of this._staticPreviews) {
			preview.updateConfiguration();
		}
	}

	public openDynamicPreview(
		resource: vscode.Uri,
		settings: DynamicPreviewSettings
	): void {
		let preview = this._dynamicPreviews.get(resource, settings);
		if (preview) {
			preview.reveal(settings.previewColumn);
		} else {
			preview = this.createNewDynamicPreview(resource, settings);
		}

		preview.update(
			resource,
			resource.fragment ? new StartingScrollFragment(resource.fragment) : undefined
		);
	}

	public get activePreviewResource() {
		return this._activePreview?.resource;
	}

	public get activePreviewResourceColumn() {
		return this._activePreview?.resourceColumn;
	}

	public toggleLock() {
		const preview = this._activePreview;
		if (preview instanceof DynamicArgdownPreview) {
			preview.toggleLock();

			// Close any previews that are now redundant, such as having two dynamic previews in the same editor group
			for (const otherPreview of this._dynamicPreviews) {
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
		const resource = vscode.Uri.parse(state.resource);

		const preview = await DynamicArgdownPreview.revive(
			{ ...state, resource },
			webview,
			this._contentProvider,
			this._previewConfigurations,
			this._logger,
			this._topmostLineMonitor,
			this._contributions,
			this._engine);

		this.registerDynamicPreview(preview);
	}

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webview: vscode.WebviewPanel
	): Promise<void> {
		const lineNumber = this._topmostLineMonitor.getPreviousTextEditorLineByUri(document.uri);
		const preview = StaticArgdownPreview.revive(
			document.uri,
			webview,
			this._contentProvider,
			this._previewConfigurations,
			this._topmostLineMonitor,
			this._logger,
			this._contributions,
			this._engine,
			lineNumber
		);
		this.registerStaticPreview(preview);
	}

	private createNewDynamicPreview(
		resource: vscode.Uri,
		previewSettings: DynamicPreviewSettings
	): DynamicArgdownPreview {
		const activeTextEditorURI = vscode.window.activeTextEditor?.document.uri;
		const scrollLine = (activeTextEditorURI?.toString() === resource.toString()) ? vscode.window.activeTextEditor?.visibleRanges[0].start.line : undefined;
		const preview = DynamicArgdownPreview.create(
			{
				resource,
				resourceColumn: previewSettings.resourceColumn,
				locked: previewSettings.locked,
				line: scrollLine,
			},
			previewSettings.previewColumn,
			this._contentProvider,
			this._previewConfigurations,
			this._logger,
			this._topmostLineMonitor,
			this._contributions,
			this._engine);

		this.setPreviewActiveContext(true);
		this._activePreview = preview;
		return this.registerDynamicPreview(preview);
	}

	private registerDynamicPreview(preview: DynamicArgdownPreview): DynamicArgdownPreview {
		this._dynamicPreviews.add(preview);

		preview.onDispose(() => {
			this._dynamicPreviews.delete(preview);
		});

		this.trackActive(preview);

		preview.onDidChangeViewState(() => {
			// Remove other dynamic previews in our column
			disposeAll(Array.from(this._dynamicPreviews).filter(otherPreview => preview !== otherPreview && preview.matches(otherPreview)));
		});
		return preview;
	}

	private registerStaticPreview(preview: StaticArgdownPreview): StaticArgdownPreview {
		this._staticPreviews.add(preview);

		preview.onDispose(() => {
			this._staticPreviews.delete(preview);
		});

		this.trackActive(preview);
		return preview;
	}

	private trackActive(preview: ManagedArgdownPreview): void {
		preview.onDidChangeViewState(({ webviewPanel }) => {
			this.setPreviewActiveContext(webviewPanel.active);
			this._activePreview = webviewPanel.active ? preview : undefined;
		});

		preview.onDispose(() => {
			if (this._activePreview === preview) {
				this.setPreviewActiveContext(false);
				this._activePreview = undefined;
			}
		});
	}

	private setPreviewActiveContext(value: boolean) {
		vscode.commands.executeCommand('setContext', ArgdownPreviewManager.markdownPreviewActiveContextKey, value);
	}
}