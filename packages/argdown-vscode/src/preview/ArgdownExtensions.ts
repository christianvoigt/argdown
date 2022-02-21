import * as vscode from "vscode";
import { ArgdownEngine } from "./ArgdownEngine";
import * as arrays from "./util/arrays";
import { Disposable } from "./util/dispose";

const resolveExtensionResource = (
  extension: vscode.Extension<any>,
  resourcePath: string
): vscode.Uri => {
  return vscode.Uri.joinPath(extension.extensionUri, resourcePath);
};

const resolveExtensionResources = (
  extension: vscode.Extension<any>,
  resourcePaths: unknown
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

export interface ArgdownContributions {
  readonly previewScripts: ReadonlyArray<vscode.Uri>;
  readonly previewStyles: ReadonlyArray<vscode.Uri>;
  readonly previewResourceRoots: ReadonlyArray<vscode.Uri>;
  readonly argdownPlugins: Map<string, Thenable<(md: any) => any>>;
}

export namespace ArgdownContributions {
  export const Empty: ArgdownContributions = {
    previewScripts: [],
    previewStyles: [],
    previewResourceRoots: [],
    argdownPlugins: new Map()
  };

  export function merge(
    a: ArgdownContributions,
    b: ArgdownContributions
  ): ArgdownContributions {
    return {
      previewScripts: [...a.previewScripts, ...b.previewScripts],
      previewStyles: [...a.previewStyles, ...b.previewStyles],
      previewResourceRoots: [
        ...a.previewResourceRoots,
        ...b.previewResourceRoots
      ],
      argdownPlugins: new Map([
        ...a.argdownPlugins.entries(),
        ...b.argdownPlugins.entries()
      ])
    };
  }

  function uriEqual(a: vscode.Uri, b: vscode.Uri): boolean {
    return a.toString() === b.toString();
  }

  export function equal(
    a: ArgdownContributions,
    b: ArgdownContributions
  ): boolean {
    return (
      arrays.equals(a.previewScripts, b.previewScripts, uriEqual) &&
      arrays.equals(a.previewStyles, b.previewStyles, uriEqual) &&
      arrays.equals(a.previewResourceRoots, b.previewResourceRoots, uriEqual) &&
      arrays.equals(
        Array.from(a.argdownPlugins.keys()),
        Array.from(b.argdownPlugins.keys())
      )
    );
  }

  export function fromExtension(
    extension: vscode.Extension<any>
  ): ArgdownContributions {
    const contributions =
      extension.packageJSON && extension.packageJSON.contributes;
    if (!contributions) {
      return ArgdownContributions.Empty;
    }

    const previewStyles = getContributedStyles(contributions, extension);
    const previewScripts = getContributedScripts(contributions, extension);
    const previewResourceRoots =
      previewStyles.length || previewScripts.length
        ? [extension.extensionUri]
        : [];
    const argdownPlugins = getContributedArgdownPlugins(
      contributions,
      extension
    );

    return {
      previewScripts,
      previewStyles,
      previewResourceRoots,
      argdownPlugins: argdownPlugins
    };
  }

  function getContributedArgdownPlugins(
    contributes: any,
    extension: vscode.Extension<any>
  ): Map<string, Thenable<(md: any) => any>> {
    const map = new Map<string, Thenable<(md: any) => any>>();
    if (contributes["argdown.argdownPlugins"]) {
      map.set(
        extension.id,
        extension.activate().then(() => {
          if (extension.exports && extension.exports.extendArgdown) {
            return (argdownEngine: ArgdownEngine) =>
              extension.exports.extendArgdown(argdownEngine);
          }
          return (argdownEngine: ArgdownEngine) => argdownEngine;
        })
      );
    }
    return map;
  }

  function getContributedScripts(
    contributes: any,
    extension: vscode.Extension<any>
  ) {
    return resolveExtensionResources(
      extension,
      contributes["argdown.previewScripts"]
    );
  }

  function getContributedStyles(
    contributes: any,
    extension: vscode.Extension<any>
  ) {
    return resolveExtensionResources(
      extension,
      contributes["argdown.previewStyles"]
    );
  }
}

export interface ArgdownContributionProvider {
  readonly extensionUri: vscode.Uri;

  readonly contributions: ArgdownContributions;
  readonly onContributionsChanged: vscode.Event<this>;

  dispose(): void;
}

class VSCodeExtensionArgdownContributionProvider extends Disposable
  implements ArgdownContributionProvider {
  private _contributions?: ArgdownContributions;

  public constructor(
    private readonly _extensionContext: vscode.ExtensionContext
  ) {
    super();

    vscode.extensions.onDidChange(
      () => {
        const currentContributions = this.getCurrentContributions();
        const existingContributions =
          this._contributions || ArgdownContributions.Empty;
        if (
          !ArgdownContributions.equal(
            existingContributions,
            currentContributions
          )
        ) {
          this._contributions = currentContributions;
          this._onContributionsChanged.fire(this);
        }
      },
      undefined,
      this._disposables
    );
  }

  public get extensionUri() {
    return this._extensionContext.extensionUri;
  }

  private readonly _onContributionsChanged = this._register(
    new vscode.EventEmitter<this>()
  );
  public readonly onContributionsChanged = this._onContributionsChanged.event;

  public get contributions(): ArgdownContributions {
    if (!this._contributions) {
      this._contributions = this.getCurrentContributions();
    }
    return this._contributions;
  }

  private getCurrentContributions(): ArgdownContributions {
    return vscode.extensions.all
      .map(ArgdownContributions.fromExtension)
      .reduce(ArgdownContributions.merge, ArgdownContributions.Empty);
  }
}

export function getArgdownExtensionContributions(
  context: vscode.ExtensionContext
): ArgdownContributionProvider {
  return new VSCodeExtensionArgdownContributionProvider(context);
}
