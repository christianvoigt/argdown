import * as vscode from "vscode";
import { ArgdownEngine } from "./ArgdownEngine";

const resolveExtensionResource = (
  extension: vscode.Extension<any>,
  resourcePath: string
): vscode.Uri => {
  return vscode.Uri.joinPath(extension.extensionUri, resourcePath);
};

const resolveExtensionResources = (
  extension: vscode.Extension<any>,
  resourcePaths: any
): vscode.Uri[] => {
  const result: vscode.Uri[] = [];
  if (Array.isArray(resourcePaths)) {
    for (const resource of resourcePaths) {
      try {
        result.push(resolveExtensionResource(extension, resource));
      } catch (e) {
        // noop
      }
    }
  }
  return result;
};

export class ArgdownExtensionContributions {
  private readonly _scripts: vscode.Uri[] = [];
  private readonly _styles: vscode.Uri[] = [];
  private readonly _previewResourceRoots: vscode.Uri[] = [];
  private readonly _plugins: Thenable<
    (argdownEngine: ArgdownEngine) => any
  >[] = [];

  private _loaded = false;

  public get previewScripts(): vscode.Uri[] {
    this.ensureLoaded();
    return this._scripts;
  }

  public get previewStyles(): vscode.Uri[] {
    this.ensureLoaded();
    return this._styles;
  }

  public get previewResourceRoots(): vscode.Uri[] {
    this.ensureLoaded();
    return this._previewResourceRoots;
  }

  public get argdownPlugins(): Thenable<
    (argdownEngine: ArgdownEngine) => any
  >[] {
    this.ensureLoaded();
    return this._plugins;
  }

  private ensureLoaded() {
    if (this._loaded) {
      return;
    }

    this._loaded = true;
    for (const extension of vscode.extensions.all) {
      const contributes =
        extension.packageJSON && extension.packageJSON.contributes;
      if (!contributes) {
        continue;
      }

      this.tryLoadPreviewStyles(contributes, extension);
      this.tryLoadPreviewScripts(contributes, extension);
      this.tryLoadArgdownPlugins(contributes, extension);

      if (
        contributes["argdown.previewScripts"] ||
        contributes["argdown.previewStyles"]
      ) {
        this._previewResourceRoots.push(
          vscode.Uri.file(extension.extensionPath)
        );
      }
    }
  }

  private tryLoadArgdownPlugins(
    contributes: any,
    extension: vscode.Extension<any>
  ) {
    if (contributes["argdown.argdownPlugins"]) {
      this._plugins.push(
        extension.activate().then(() => {
          if (extension.exports && extension.exports.extendArgdown) {
            return (argdownEngine: ArgdownEngine) =>
              extension.exports.extendArgdown(argdownEngine);
          }
          return (argdownEngine: ArgdownEngine) => argdownEngine;
        })
      );
    }
  }

  private tryLoadPreviewScripts(
    contributes: any,
    extension: vscode.Extension<any>
  ) {
    this._scripts.push(
      ...resolveExtensionResources(
        extension,
        contributes["argdown.previewScripts"]
      )
    );
  }

  private tryLoadPreviewStyles(
    contributes: any,
    extension: vscode.Extension<any>
  ) {
    this._styles.push(
      ...resolveExtensionResources(
        extension,
        contributes["argdown.previewStyles"]
      )
    );
  }
}
