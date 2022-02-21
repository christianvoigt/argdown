import * as vscode from "vscode";
import { ArgdownEngine } from "./ArgdownEngine";

import {
  ContentSecurityPolicyArbiter,
  ArgdownPreviewSecurityLevel
} from "./security";
import {
  ArgdownPreviewConfigurationManager,
  ArgdownPreviewConfiguration
} from "./ArgdownPreviewConfiguration";
import { PreviewViews } from "./ArgdownPreview";
import { IDictionary } from "./util/IDictionary";
import { IArgdownPreviewState } from "./IArgdownPreviewState";
import { jsonReplacer } from "@argdown/core";
import { vizjsViewProvider } from "./vizjsViewProvider";
import { dagreViewProvider } from "./dagreViewProvider";
import { htmlViewProvider } from "./htmlViewProvider";
import { IViewProvider } from "./IViewProvider";
import { WebviewResourceProvider } from "./util/resources";
import { basename, dirname, isAbsolute, join } from "./util/path";
import { ArgdownContributionProvider } from "./ArgdownExtensions";
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
function escapeAttribute(value: string | vscode.Uri): string {
  return value.toString().replace(/"/g, "&quot;");
}
export class ArgdownContentProvider {
  private viewProviders: IDictionary<IViewProvider> = {};
  constructor(
    private readonly engine: ArgdownEngine,
    private readonly context: vscode.ExtensionContext,
    private readonly cspArbiter: ContentSecurityPolicyArbiter,
    private readonly contributionProvider: ArgdownContributionProvider
  ) {
    this.viewProviders[PreviewViews.HTML] = htmlViewProvider;
    this.viewProviders[PreviewViews.DAGRE] = dagreViewProvider;
    this.viewProviders[PreviewViews.VIZJS] = vizjsViewProvider;
  }
  public async provideOnDidChangeTextDocumentMessage(
    currentView: string,
    argdownDocument: vscode.TextDocument,
    previewConfigurations: ArgdownPreviewConfigurationManager
    // , initialLine: number | undefined = undefined
  ): Promise<any> {
    const sourceUri = argdownDocument.uri;
    const config = previewConfigurations.getConfiguration(sourceUri);
    const viewProvider = this.viewProviders[currentView];
    return await viewProvider.generateOnDidChangeTextDocumentMessage(
      this.engine,
      argdownDocument,
      config
    );
  }
  public get iconPath() {
    const root = vscode.Uri.joinPath(
      this.context.extensionUri,
      "media",
      "icons"
    );
    return {
      light: vscode.Uri.joinPath(root, "light", "preview.svg"),
      dark: vscode.Uri.joinPath(root, "dark", "preview.svg")
    };
  }
  public async provideHtmlContent(
    argdownDocument: vscode.TextDocument,
    resourceProvider: WebviewResourceProvider,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    initialState: IArgdownPreviewState
  ): Promise<string> {
    const sourceUri = argdownDocument.uri;
    const config = previewConfigurations.getConfiguration(sourceUri);
    const view =
      initialState.currentView || config.defaultView || PreviewViews.VIZJS;
    const viewProvider = this.viewProviders[view];
    const settings = {
      source: sourceUri.toString(),
      scrollPreviewWithEditor: config.scrollPreviewWithEditor,
      scrollEditorWithPreview: config.scrollEditorWithPreview,
      syncPreviewSelectionWithEditor: config.syncPreviewSelectionWithEditor,
      doubleClickToSwitchToEditor: config.doubleClickToSwitchToEditor,
      disableSecurityWarnings: this.cspArbiter.shouldDisableSecurityWarnings(),
      webviewResourceRoot: resourceProvider
        .asWebviewUri(argdownDocument.uri)
        .toString()
    };

    // Content Security Policy
    const nonce = getNonce();
    const csp = this.getCsp(resourceProvider, sourceUri, nonce);
    let viewHtml = "";
    viewHtml = await viewProvider.generateView(
      this.engine,
      argdownDocument,
      config,
      nonce
    );
    viewHtml = `<div class="view ${view}-view">${viewHtml}</div>`;
    const subMenu = viewProvider.generateSubMenu();
    const menuHtml = this.generateMenu(view, subMenu);
    const body = menuHtml + viewHtml;
    const menuLocked = config.lockMenu;

    initialState = await viewProvider.contributeToInitialState(
      initialState,
      this.engine,
      argdownDocument,
      config
    );
    return `<!DOCTYPE html>
			<html style="${escapeAttribute(this.getSettingsOverrideStyles(config))}">
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				${csp}
				<meta id="vscode-argdown-preview-data" data-settings="${escapeAttribute(
          JSON.stringify(settings)
        )}" data-strings="${escapeAttribute(JSON.stringify(previewStrings))}">
				<script src="${this.extensionResourcePath(
          resourceProvider,
          "pre.js"
        ).toString()}" nonce="${nonce}"></script>
				<script nonce="${nonce}">window.initialState = ${JSON.stringify(
      initialState,
      jsonReplacer
    )};</script>
				${this.getStyles(resourceProvider, sourceUri, config)}
				<base href="${resourceProvider.asWebviewUri(argdownDocument.uri)}">
			</head>
			<body class="vscode-body argdown ${view}-active ${
      menuLocked ? "locked" : "unlocked"
    }-menu ${config.scrollBeyondLastLine ? "scrollBeyondLastLine" : ""} ${
      config.wordWrap ? "wordWrap" : ""
    } ${config.markEditorSelection ? "showEditorSelection" : ""}">
				${body}
				${this.getScriptsForView(resourceProvider, viewProvider.scripts, nonce)}
				${this.getScripts(resourceProvider, nonce)}
			</body>
			</html>`;
  }
  private generateMenu(activeView: string, subMenu: string): string {
    return `<div class="main-menu-hover-field"><nav class="main-menu">
	<ul>
    <li><a title="Show Viz.Js Map" data-message="didChangeView" data-view="${
      PreviewViews.VIZJS
    }" class="${
      activeView == PreviewViews.VIZJS ? "active" : "inactive"
    }" href="#">Viz.Js Map</a></li>	
	<li><a title="Show Dagre Map" data-message="didChangeView" data-view="${
    PreviewViews.DAGRE
  }" class="${
      activeView == PreviewViews.DAGRE ? "active" : "inactive"
    }" href="#">Dagre Map</a></li>
    <li><a title="Show HTML" data-message="didChangeView" data-view="${
      PreviewViews.HTML
    }" class="${
      activeView == PreviewViews.HTML ? "active" : "inactive"
    }" href="#">Html</a></li>
	</ul>
	${subMenu}
	<a title="Lock preview menu" class="lock-menu icon-button" data-message="didChangeLockMenu" data-lockmenu="true" href="#"><span>lock</span></a>
	<a title="Unlock preview menu (only shows the menu if mouse moves to the top of the preview)" class="unlock-menu icon-button" data-message="didChangeLockMenu" data-lockmenu="false" href="#"><span>unlock</span></a>
	</nav></div>`;
  }
  public provideFileNotFoundContent(resource: vscode.Uri): string {
    const resourcePath = basename(resource.fsPath);
    const body = `${resourcePath} cannot be found`;
    return `<!DOCTYPE html>
			<html>
			<body class="vscode-body">
				${body}
			</body>
			</html>`;
  }
  private extensionResourcePath(
    resourceProvider: WebviewResourceProvider,
    mediaFile: string
  ): vscode.Uri {
    return resourceProvider.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", mediaFile)
    );
  }
  private fixHref(
    resourceProvider: WebviewResourceProvider,
    resource: vscode.Uri,
    href: string
  ): string {
    if (!href) {
      return href;
    }
    if (
      href.startsWith("http:") ||
      href.startsWith("https:") ||
      href.startsWith("file:")
    ) {
      return href;
    }

    // Assume it must be a local file
    if (isAbsolute(href)) {
      return resourceProvider.asWebviewUri(vscode.Uri.file(href)).toString();
    }

    // Use a workspace relative path if there is a workspace
    const root = vscode.workspace.getWorkspaceFolder(resource);
    if (root) {
      return resourceProvider
        .asWebviewUri(vscode.Uri.joinPath(root.uri, href))
        .toString();
    }

    // Otherwise look relative to the Argdown file
    return resourceProvider
      .asWebviewUri(vscode.Uri.file(join(dirname(resource.fsPath), href)))
      .toString();
  }

  private computeCustomStyleSheetIncludes(
    resourceProvider: WebviewResourceProvider,
    resource: vscode.Uri,
    config: ArgdownPreviewConfiguration
  ): string {
    if (!Array.isArray(config.styles)) {
      return "";
    }
    const out: string[] = [];
    for (const style of config.styles) {
      out.push(
        `<link rel="stylesheet" class="code-user-style" data-source="${escapeAttribute(
          style
        )}" href="${escapeAttribute(
          this.fixHref(resourceProvider, resource, style)
        )}" type="text/css" media="screen">`
      );
    }
    return out.join("\n");
  }

  private getSettingsOverrideStyles(
    config: ArgdownPreviewConfiguration
  ): string {
    return [
      config.fontFamily ? `--argdown-font-family: ${config.fontFamily};` : "",
      isNaN(config.fontSize)
        ? ""
        : `--argdown-font-size: ${config.fontSize}px;`,
      isNaN(config.lineHeight)
        ? ""
        : `--argdown-line-height: ${config.lineHeight};`
    ].join(" ");
  }
  private getStyles(
    resourceProvider: WebviewResourceProvider,
    resource: vscode.Uri,
    config: ArgdownPreviewConfiguration
  ): string {
    const baseStyles: string[] = [];
    for (const resource of this.contributionProvider.contributions
      .previewStyles) {
      baseStyles.push(
        `<link rel="stylesheet" type="text/css" href="${escapeAttribute(
          resourceProvider.asWebviewUri(resource)
        )}">`
      );
    }
    return `${baseStyles.join("\n")}
			${this.computeCustomStyleSheetIncludes(resourceProvider, resource, config)}`;
  }
  private getScriptsForView(
    resourceProvider: WebviewResourceProvider,
    scripts: string[],
    nonce: string
  ): string {
    return scripts
      .map(
        script =>
          `<script src="${escapeAttribute(
            resourceProvider.asWebviewUri(
              this.extensionResourcePath(resourceProvider, script)
            )
          )}" nonce="${nonce}" charset="UTF-8"></script>`
      )
      .join("\n");
  }
  private getScripts(
    resourceProvider: WebviewResourceProvider,
    nonce: string
  ): string {
    const out: string[] = [];
    for (const resource of this.contributionProvider.contributions
      .previewScripts) {
      out.push(`<script async
				src="${escapeAttribute(resourceProvider.asWebviewUri(resource))}"
				nonce="${nonce}"
				charset="UTF-8"></script>`);
    }
    return out.join("\n");
  }

  private getCsp(
    provider: WebviewResourceProvider,
    resource: vscode.Uri,
    nonce: string
  ): string {
    const rule = provider.cspSource;
    const securityLevel = this.cspArbiter.getSecurityLevelForResource(resource);
    switch (securityLevel) {
      case ArgdownPreviewSecurityLevel.AllowInsecureContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' ${rule} http: https: data:; media-src 'self' ${rule} http: https: data:; script-src 'nonce-${nonce}'; style-src 'self' ${rule} 'unsafe-inline' http: https: data:; font-src 'self' ${rule} http: https: data:;">`;
      case ArgdownPreviewSecurityLevel.AllowInsecureLocalContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' ${rule} https: data: http://localhost:* http://127.0.0.1:*; media-src 'self' ${rule} https: data: http://localhost:* http://127.0.0.1:*; script-src 'nonce-${nonce}'; style-src 'self' ${rule} 'unsafe-inline' https: data: http://localhost:* http://127.0.0.1:*; font-src 'self' ${rule} https: data: http://localhost:* http://127.0.0.1:*;">`;

      case ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent:
        return `<meta http-equiv="Content-Security-Policy" content="">`;

      case ArgdownPreviewSecurityLevel.Strict:
      default:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' ${rule} https: data:; media-src 'self' ${rule} https: data:; script-src 'nonce-${nonce}'; style-src 'self' ${rule} 'unsafe-inline' https: data:; font-src 'self' ${rule} https: data:;">`;
    }
  }
}
function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 64; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
