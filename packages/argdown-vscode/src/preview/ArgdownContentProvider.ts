import * as vscode from "vscode";
import * as path from "path";
import { ArgdownEngine } from "./ArgdownEngine";

import { Logger } from "./Logger";
import {
  ContentSecurityPolicyArbiter,
  ArgdownPreviewSecurityLevel
} from "./security";
import {
  ArgdownPreviewConfigurationManager,
  ArgdownPreviewConfiguration
} from "./ArgdownPreviewConfiguration";
import { ArgdownExtensionContributions } from "./ArgdownExtensionContributions";
import { PreviewViews } from "./ArgdownPreview";
import { IDictionary } from "./util/IDictionary";

/**
 * Strings used inside the argdown preview.
 *
 * Stored here and then injected in the preview so that they
 * can be localized using our normal localization process.
 */
const previewStrings = {
  cspAlertMessageText: "Some content has been disabled in this document",

  cspAlertMessageTitle:
    "Potentially unsafe or insecure content has been disabled in the argdown preview. Change the Argdown preview security setting to allow insecure content or enable scripts",

  cspAlertMessageLabel: "Content Disabled Security Warning"
};

export interface IViewProvider {
  generateView(
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<string>;
  generateSubMenu(): string;
  generateOnDidChangeTextDocumentMessage(
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<any>;
  scripts: string[];
}

const htmlViewProvider: IViewProvider = {
  scripts: ["htmlView.js"],
  generateView: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    let html = await argdownEngine.exportHtml(argdownDocument, config);
    return `${html}<div class="has-line" data-line="${
      argdownDocument.lineCount
    }"></div>`;
  },
  generateSubMenu: () => {
    return `<nav class="submenu">
	Save as <a data-command="argdown.exportDocumentToJson" href="#">json</a> | <a data-command="argdown.exportDocumentToHtml" href="#">html</a> | <a data-command="argdown.exportDocumentToDot" href="#">dot</a>
	</nav>`;
  },
  generateOnDidChangeTextDocumentMessage: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    let html = await argdownEngine.exportHtml(argdownDocument, config);
    return {
      html: `${html}<div class="has-line" data-line="${
        argdownDocument.lineCount
      }"></div>`
    };
  }
};
const dagreViewProvider: IViewProvider = {
  scripts: ["dagreView.js"],
  generateView: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    let json = await argdownEngine.exportJson(argdownDocument, config);
    json = json.replace(/"/g, "&quot;");
    return `<div id="argdown-json-data" data-argdown="${json}"></div>
        <svg id="dagre-svg" ref="svg" width="100%" height="100%">
          <g class="dagre" style="transform: translate(0, 10px)">
          </g>
        </svg>		
		`;
  },
  generateSubMenu: () => {
    return `<nav class="submenu">Save as <a data-command="argdown.exportContentToDagreSvg" href="#">svg</a> | <a data-command="argdown.exportContentToDagrePng" href="#">png</a> | <a data-command="argdown.exportContentToDagreSvg" href="#">pdf</a>
	</nav>`;
  },
  generateOnDidChangeTextDocumentMessage: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    const json = await argdownEngine.exportJson(argdownDocument, config);
    return { json };
  }
};
const vizjsViewProvider: IViewProvider = {
  scripts: ["vizjsView.js"],
  generateView: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    const svg = await argdownEngine.exportVizjs(argdownDocument, config);
    return `<div id="svg-container">${svg}</div>`;
  },
  generateSubMenu: () => {
    return `<nav class="submenu">
	Save as <a data-command="argdown.exportDocumentToVizjsSvg" href="#">svg</a> | <a data-command="argdown.exportContentToVizjsPng" href="#">png</a> | <a data-command="argdown.exportDocumentToVizjsPdf" href="#">pdf</a>
	</nav>`;
  },
  generateOnDidChangeTextDocumentMessage: async (
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ) => {
    const svg = await argdownEngine.exportVizjs(argdownDocument, config);
    return { svg: svg };
  }
};

export class ArgdownContentProvider {
  private viewProviders: IDictionary<IViewProvider> = {};
  constructor(
    private readonly engine: ArgdownEngine,
    private readonly context: vscode.ExtensionContext,
    private readonly cspArbiter: ContentSecurityPolicyArbiter,
    private readonly contributions: ArgdownExtensionContributions,
    private readonly logger: Logger
  ) {
    this.viewProviders[PreviewViews.HTML] = htmlViewProvider;
    this.viewProviders[PreviewViews.DAGRE] = dagreViewProvider;
    this.viewProviders[PreviewViews.VIZJS] = vizjsViewProvider;
  }
  public async provideOnDidChangeTextDocumentMessage(
    argdownDocument: vscode.TextDocument,
    previewConfigurations: ArgdownPreviewConfigurationManager
    // , initialLine: number | undefined = undefined
  ): Promise<any> {
    const sourceUri = argdownDocument.uri;
    const config = previewConfigurations.getConfiguration(sourceUri);
    const viewProvider =
      this.viewProviders[config.view] || this.viewProviders[PreviewViews.HTML];
    return await viewProvider.generateOnDidChangeTextDocumentMessage(
      this.engine,
      argdownDocument,
      config
    );
  }

  public async provideHtmlContent(
    argdownDocument: vscode.TextDocument,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    initialLine: number | undefined = undefined,
    state: { [key: string]: any }
  ): Promise<string> {
    const sourceUri = argdownDocument.uri;
    const config = previewConfigurations.getConfiguration(sourceUri);
    const view = config.view;
    const viewProvider =
      this.viewProviders[view] || this.viewProviders[PreviewViews.HTML];
    const viewStateStore = state[view];
    const initialData = {
      source: sourceUri.toString(),
      line: initialLine,
      lineCount: argdownDocument.lineCount,
      scrollPreviewWithEditor: config.scrollPreviewWithEditor,
      scrollEditorWithPreview: config.scrollEditorWithPreview,
      syncPreviewSelectionWithEditor: config.syncPreviewSelectionWithEditor,
      doubleClickToSwitchToEditor: config.doubleClickToSwitchToEditor,
      disableSecurityWarnings: this.cspArbiter.shouldDisableSecurityWarnings(),
      ...viewStateStore
    };
    if (view === PreviewViews.DAGRE) {
      initialData.dagre = {
        nodeSep: config.dagreNodeSep,
        rankSep: config.dagreRankSep,
        rankDir: config.dagreRankDir
      };
    }

    // Content Security Policy
    const nonce = new Date().getTime() + "" + new Date().getMilliseconds();
    const csp = this.getCspForResource(sourceUri, nonce);
    let viewHtml = "";
    try {
      viewHtml = await viewProvider.generateView(
        this.engine,
        argdownDocument,
        config
      );
      viewHtml = `<div class="view ${view}-view">${viewHtml}</div>`;
    } catch (e) {
      this.logger.log("error from Argdown app: " + e.toString());
    }
    const subMenu = viewProvider.generateSubMenu();
    const menuHtml = this.generateMenu(view, subMenu);
    const body = menuHtml + viewHtml;
    const menuLocked = config.lockMenu;
    return `<!DOCTYPE html>
			<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				${csp}
				<meta id="vscode-argdown-preview-data" data-settings="${JSON.stringify(
          initialData
        ).replace(/"/g, "&quot;")}" data-strings="${JSON.stringify(
      previewStrings
    ).replace(/"/g, "&quot;")}">
				<script src="${this.extensionResourcePath("pre.js")}" nonce="${nonce}"></script>
				${this.getStyles(sourceUri, nonce, config)}
				<base href="${argdownDocument.uri
          .with({ scheme: "vscode-resource" })
          .toString(true)}">
			</head>
			<body class="vscode-body argdown ${view}-active ${
      menuLocked ? "locked" : "unlocked"
    }-menu ${config.scrollBeyondLastLine ? "scrollBeyondLastLine" : ""} ${
      config.wordWrap ? "wordWrap" : ""
    } ${config.markEditorSelection ? "showEditorSelection" : ""}">
				${body}
				${this.getScriptsForView(viewProvider.scripts, nonce)}
				${this.getScripts(nonce)}
			</body>
			</html>`;
  }
  private generateMenu(activeView: string, subMenu: string): string {
    return `<div class="main-menu-hover-field"><nav class="main-menu">
	<ul>
	<li><a title="Show HTML" data-message="didChangeView" data-view="${
    PreviewViews.HTML
  }" class="${
      activeView == PreviewViews.HTML ? "active" : "inactive"
    }" href="#">Html</a></li>
	<li><a title="Show Dagre Map" data-message="didChangeView" data-view="${
    PreviewViews.DAGRE
  }" class="${
      activeView == PreviewViews.DAGRE ? "active" : "inactive"
    }" href="#">Dagre Map</a></li>
	<li><a title="Show Viz.Js Map" data-message="didChangeView" data-view="${
    PreviewViews.VIZJS
  }" class="${
      activeView == PreviewViews.VIZJS ? "active" : "inactive"
    }" href="#">Viz.Js Map</a></li>	
	</ul>
	${subMenu}
	<a title="Lock preview menu" class="lock-menu icon-button" data-message="didChangeLockMenu" data-lockmenu="true" href="#"><span>lock</span></a>
	<a title="Unlock preview menu (only shows the menu if mouse moves to the top of the preview)" class="unlock-menu icon-button" data-message="didChangeLockMenu" data-lockmenu="false" href="#"><span>unlock</span></a>
	</nav></div>`;
  }

  private extensionResourcePath(mediaFile: string): string {
    return vscode.Uri.file(
      this.context.asAbsolutePath(path.join("media", mediaFile))
    )
      .with({ scheme: "vscode-resource" })
      .toString();
  }

  private fixHref(resource: vscode.Uri, href: string): string {
    if (!href) {
      return href;
    }

    // Use href if it is already an URL
    const hrefUri = vscode.Uri.parse(href);
    if (["http", "https"].indexOf(hrefUri.scheme) >= 0) {
      return hrefUri.toString();
    }

    // Use href as file URI if it is absolute
    if (path.isAbsolute(href) || hrefUri.scheme === "file") {
      return vscode.Uri.file(href)
        .with({ scheme: "vscode-resource" })
        .toString();
    }

    // Use a workspace relative path if there is a workspace
    let root = vscode.workspace.getWorkspaceFolder(resource);
    if (root) {
      return vscode.Uri.file(path.join(root.uri.fsPath, href))
        .with({ scheme: "vscode-resource" })
        .toString();
    }

    // Otherwise look relative to the argdown file
    return vscode.Uri.file(path.join(path.dirname(resource.fsPath), href))
      .with({ scheme: "vscode-resource" })
      .toString();
  }

  private computeCustomStyleSheetIncludes(
    resource: vscode.Uri,
    config: ArgdownPreviewConfiguration
  ): string {
    if (Array.isArray(config.styles)) {
      return config.styles
        .map(style => {
          return `<link rel="stylesheet" class="code-user-style" data-source="${style.replace(
            /"/g,
            "&quot;"
          )}" href="${this.fixHref(
            resource,
            style
          )}" type="text/css" media="screen">`;
        })
        .join("\n");
    }
    return "";
  }

  private getSettingsOverrideStyles(
    nonce: string,
    config: ArgdownPreviewConfiguration
  ): string {
    return `<style nonce="${nonce}">
			body {
				${config.fontFamily ? `font-family: ${config.fontFamily};` : ""}
				${isNaN(config.fontSize) ? "" : `font-size: ${config.fontSize}px;`}
				${isNaN(config.lineHeight) ? "" : `line-height: ${config.lineHeight};`}
			}
		</style>`;
  }

  private getStyles(
    resource: vscode.Uri,
    nonce: string,
    config: ArgdownPreviewConfiguration
  ): string {
    const baseStyles = this.contributions.previewStyles
      .map(
        resource =>
          `<link rel="stylesheet" type="text/css" href="${resource.toString()}">`
      )
      .join("\n");

    return `${baseStyles}
			${this.getSettingsOverrideStyles(nonce, config)}
			${this.computeCustomStyleSheetIncludes(resource, config)}`;
  }
  private getScriptsForView(scripts: string[], nonce: string): string {
    return scripts
      .map(
        script =>
          `<script async src="${this.extensionResourcePath(
            script
          )}" nonce="${nonce}" charset="UTF-8"></script>`
      )
      .join("\n");
  }
  private getScripts(nonce: string): string {
    return this.contributions.previewScripts
      .map(
        resource =>
          `<script async src="${resource.toString()}" nonce="${nonce}" charset="UTF-8"></script>`
      )
      .join("\n");
  }

  private getCspForResource(resource: vscode.Uri, nonce: string): string {
    switch (this.cspArbiter.getSecurityLevelForResource(resource)) {
      case ArgdownPreviewSecurityLevel.AllowInsecureContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: http: https: data:; media-src vscode-resource: http: https: data:; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline' http: https: data:; font-src vscode-resource: http: https: data:;">`;

      case ArgdownPreviewSecurityLevel.AllowInsecureLocalContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https: data: http://localhost:* http://127.0.0.1:*; media-src vscode-resource: https: data: http://localhost:* http://127.0.0.1:*; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline' https: data: http://localhost:* http://127.0.0.1:*; font-src vscode-resource: https: data: http://localhost:* http://127.0.0.1:*;">`;

      case ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent:
        return "";

      case ArgdownPreviewSecurityLevel.Strict:
      default:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https: data:; media-src vscode-resource: https: data:; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline' https: data:; font-src vscode-resource: https: data:;">`;
    }
  }
}
