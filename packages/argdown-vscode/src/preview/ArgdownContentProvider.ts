import * as vscode from "vscode";
import * as path from "path";
import { ArgdownEngine } from "./ArgdownEngine";

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
import { IArgdownPreviewState } from "./IArgdownPreviewState";
import { jsonReplacer } from "@argdown/core";
import { vizjsViewProvider } from "./vizjsViewProvider";
import { dagreViewProvider } from "./dagreViewProvider";
import { htmlViewProvider } from "./htmlViewProvider";
import { IViewProvider } from "./IViewProvider";
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

export class ArgdownContentProvider {
  private viewProviders: IDictionary<IViewProvider> = {};
  constructor(
    private readonly engine: ArgdownEngine,
    private readonly context: vscode.ExtensionContext,
    private readonly cspArbiter: ContentSecurityPolicyArbiter,
    private readonly contributions: ArgdownExtensionContributions
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
    const root = path.join(this.context.extensionPath, "media", "icons");
    return {
      light: vscode.Uri.file(path.join(root, "light", "preview.svg")),
      dark: vscode.Uri.file(path.join(root, "dark", "preview.svg"))
    };
  }
  public async provideHtmlContent(
    argdownDocument: vscode.TextDocument,
    previewConfigurations: ArgdownPreviewConfigurationManager,
    initialState: IArgdownPreviewState,
    webview: vscode.Webview
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
      cspSource: webview.cspSource
    };

    // Content Security Policy
    const nonce = new Date().getTime() + "" + new Date().getMilliseconds();
    const csp = this.getCspForResource(sourceUri, nonce, webview.cspSource);
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
			<html>
			<head>
				<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
				${csp}
				<meta id="vscode-argdown-preview-data" data-settings="${JSON.stringify(
          settings
        ).replace(/"/g, "&quot;")}" data-strings="${JSON.stringify(
      previewStrings
    ).replace(/"/g, "&quot;")}">
				<script src="${this.extensionResourcePath("pre.js", webview)}" nonce="${nonce}"></script>
				<script nonce="${nonce}">window.initialState = ${JSON.stringify(
      initialState,
      jsonReplacer
    )};</script>
				${this.getStyles(sourceUri, nonce, config, webview)}
				<base href="${webview.asWebviewUri(argdownDocument.uri).toString()}">
			</head>
			<body class="vscode-body argdown ${view}-active ${
      menuLocked ? "locked" : "unlocked"
    }-menu ${config.scrollBeyondLastLine ? "scrollBeyondLastLine" : ""} ${
      config.wordWrap ? "wordWrap" : ""
    } ${config.markEditorSelection ? "showEditorSelection" : ""}">
				${body}
				${this.getScriptsForView(viewProvider.scripts, nonce, webview)}
				${this.getScripts(nonce)}
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

  private extensionResourcePath(mediaFile: string, webview:vscode.Webview): vscode.Uri {
    return webview.asWebviewUri(vscode.Uri.file(
      this.context.asAbsolutePath(path.join("media", mediaFile))
    ));
  }

  private fixHref(resource: vscode.Uri, href: string, webview:vscode.Webview): string{
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
      return webview.asWebviewUri(vscode.Uri.file(href)).toString();
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
    config: ArgdownPreviewConfiguration,
    webview: vscode.Webview
  ): string {
    if (Array.isArray(config.styles)) {
      return config.styles
        .map(style => {
          return `<link rel="stylesheet" class="code-user-style" data-source="${style.replace(
            /"/g,
            "&quot;"
          )}" href="${this.fixHref(
            resource,
            style,
            webview
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
    config: ArgdownPreviewConfiguration,
    webview: vscode.Webview
  ): string {
    const baseStyles = this.contributions.previewStyles
      .map(
        resource =>
          `<link rel="stylesheet" type="text/css" href="${resource.toString()}">`
      )
      .join("\n");

    return `${baseStyles}
			${this.getSettingsOverrideStyles(nonce, config)}
			${this.computeCustomStyleSheetIncludes(resource, config, webview)}`;
  }
  private getScriptsForView(scripts: string[], nonce: string, webview:vscode.Webview): string {
    return scripts
      .map(
        script =>
          `<script src="${this.extensionResourcePath(
            script, webview
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

  private getCspForResource(
    resource: vscode.Uri,
    nonce: string,
    cspSource: string
  ): string {
    switch (this.cspArbiter.getSecurityLevelForResource(resource)) {
      case ArgdownPreviewSecurityLevel.AllowInsecureContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} http: https: data:; media-src ${cspSource} http: https: data:; script-src 'nonce-${nonce}'; style-src ${cspSource} 'unsafe-inline' http: https: data:; font-src ${cspSource} http: https: data:;">`;

      case ArgdownPreviewSecurityLevel.AllowInsecureLocalContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} https: data: http://localhost:* http://127.0.0.1:*; media-src ${cspSource} https: data: http://localhost:* http://127.0.0.1:*; script-src 'nonce-${nonce}'; style-src ${cspSource} 'unsafe-inline' https: data: http://localhost:* http://127.0.0.1:*; font-src ${cspSource} https: data: http://localhost:* http://127.0.0.1:*;">`;

      case ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent:
        return "";

      case ArgdownPreviewSecurityLevel.Strict:
      default:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} https: data:; media-src ${cspSource} https: data:; script-src 'nonce-${nonce}'; style-src ${cspSource} 'unsafe-inline' https: data:; font-src ${cspSource} https: data:;">`;
    }
  }
}
