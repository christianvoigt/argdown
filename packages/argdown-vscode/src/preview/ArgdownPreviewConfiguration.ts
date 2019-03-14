import * as vscode from "vscode";
import { ArgdownEngine } from "./ArgdownEngine";
import { IArgdownRequest } from "@argdown/core";

export class ArgdownPreviewConfiguration {
  public static getForResource(
    resource: vscode.Uri,
    argdownEngine: ArgdownEngine
  ) {
    return new ArgdownPreviewConfiguration(resource, argdownEngine);
  }

  public readonly scrollBeyondLastLine: boolean;
  public readonly doubleClickToSwitchToEditor: boolean;
  public readonly scrollEditorWithPreview: boolean;
  public readonly scrollPreviewWithEditor: boolean;
  public readonly syncPreviewSelectionWithEditor: boolean;
  public readonly markEditorSelection: boolean;
  public readonly minDelayBetweenUpdates: number;

  public readonly lineHeight: number;
  public readonly fontSize: number;
  public readonly fontFamily: string | undefined;
  public readonly lockMenu: boolean;
  public readonly styles: string[];
  public readonly argdownConfigFile?: string;
  public readonly defaultView?: string;
  public argdownConfig?: IArgdownRequest;

  private constructor(resource: vscode.Uri, argdownEngine: ArgdownEngine) {
    const editorConfig = vscode.workspace.getConfiguration("editor", resource);
    const argdownConfig = vscode.workspace.getConfiguration(
      "argdown",
      resource
    );
    this.minDelayBetweenUpdates = argdownConfig.get<number>(
      "preview.minDelayBetweenUpdates",
      300
    );
    this.scrollBeyondLastLine = editorConfig.get<boolean>(
      "scrollBeyondLastLine",
      false
    );
    this.scrollPreviewWithEditor = !!argdownConfig.get<boolean>(
      "preview.scrollPreviewWithEditor",
      true
    );
    this.scrollEditorWithPreview = !!argdownConfig.get<boolean>(
      "preview.scrollEditorWithPreview",
      true
    );
    this.doubleClickToSwitchToEditor = !!argdownConfig.get<boolean>(
      "preview.doubleClickToSwitchToEditor",
      true
    );
    this.syncPreviewSelectionWithEditor = !!argdownConfig.get<boolean>(
      "preview.syncPreviewSelectionWithEditor",
      true
    );
    this.markEditorSelection = !!argdownConfig.get<boolean>(
      "preview.markEditorSelection",
      true
    );
    this.defaultView = argdownConfig.get<string>(
      "preview.defaultView",
      "vizjs"
    );
    this.lockMenu = !!argdownConfig.get<boolean>("preview.lockMenu", true);
    this.argdownConfigFile = argdownConfig.get<string | undefined>(
      "configFile",
      undefined
    );
    this.refreshArgdownConfig(resource, argdownEngine);

    this.fontFamily = argdownConfig.get<string | undefined>(
      "preview.fontFamily",
      undefined
    );
    this.fontSize = Math.max(
      8,
      +argdownConfig.get<number>("preview.fontSize", NaN)
    );
    this.lineHeight = Math.max(
      0.6,
      +argdownConfig.get<number>("preview.lineHeight", NaN)
    );

    this.styles = argdownConfig.get<string[]>("styles", []);
  }

  public isEqualTo(otherConfig: ArgdownPreviewConfiguration) {
    for (let key in this) {
      if (
        this.hasOwnProperty(key) &&
        key !== "styles" &&
        key !== "argdownConfig"
      ) {
        if (this[key] !== otherConfig[key]) {
          return false;
        }
      }
    }

    // Check styles
    if (this.styles.length !== otherConfig.styles.length) {
      return false;
    }
    for (let i = 0; i < this.styles.length; ++i) {
      if (this.styles[i] !== otherConfig.styles[i]) {
        return false;
      }
    }

    return true;
  }
  async refreshArgdownConfig(
    resource: vscode.Uri,
    argdownEngine: ArgdownEngine
  ) {
    this.argdownConfig =
      (await argdownEngine.loadConfig(this.argdownConfigFile, resource)) || {};
  }

  [key: string]: any;
}

export class ArgdownPreviewConfigurationManager {
  private readonly previewConfigurationsForWorkspaces = new Map<
    string,
    ArgdownPreviewConfiguration
  >();

  public constructor(private _argdownEngine: ArgdownEngine) {}
  public getConfiguration(resource: vscode.Uri): ArgdownPreviewConfiguration {
    const config = this.previewConfigurationsForWorkspaces.get(
      this.getKey(resource)
    );
    if (!config) {
      return this.loadAndCacheConfiguration(resource);
    }
    return config;
  }
  public loadAndCacheConfiguration(
    resource: vscode.Uri
  ): ArgdownPreviewConfiguration {
    const config = ArgdownPreviewConfiguration.getForResource(
      resource,
      this._argdownEngine
    );
    this.previewConfigurationsForWorkspaces.set(this.getKey(resource), config);
    return config;
  }
  public async refreshArgdownConfig(resource: vscode.Uri) {
    const config = this.getConfiguration(resource);
    if (config) {
      await config.refreshArgdownConfig(resource, this._argdownEngine);
    }
  }

  public hasConfigurationChanged(resource: vscode.Uri): boolean {
    const key = this.getKey(resource);
    const currentConfig = this.previewConfigurationsForWorkspaces.get(key);
    const newConfig = ArgdownPreviewConfiguration.getForResource(
      resource,
      this._argdownEngine
    );
    return !currentConfig || !currentConfig.isEqualTo(newConfig);
  }

  private getKey(resource: vscode.Uri): string {
    const folder = vscode.workspace.getWorkspaceFolder(resource);
    return folder ? folder.uri.toString() : "";
  }
}
