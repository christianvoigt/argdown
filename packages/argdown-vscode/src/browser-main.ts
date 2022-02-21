import { ExtensionContext, Uri } from "vscode";
import { LanguageClientOptions } from "vscode-languageclient";

import { LanguageClient } from "vscode-languageclient/browser";
import * as vscode from "vscode";
import createArgdownMarkdownItPlugin from "@argdown/markdown-it-plugin";
import { browserConfigLoader } from "./browserConfigLoader";
import { ArgdownEngine } from "./preview/ArgdownEngine";
import { Logger } from "./preview/Logger";
import {
  ExtensionContentSecurityPolicyArbiter,
  PreviewSecuritySelector
} from "./preview/security";
import { ArgdownContentProvider } from "./preview/ArgdownContentProvider";
import { ArgdownPreviewManager } from "./preview/ArgdownPreviewManager";
import { CommandManager } from "./commands/CommandManager";
import * as commands from "./commands/index";
import { getArgdownExtensionContributions } from "./preview/ArgdownExtensions";

let client: LanguageClient;

// this method is called when vs code is activated
export function activate(context: ExtensionContext) {
  const logger = new Logger();
  logger.log("Activating Argdown extension!");
  const argdownEngine = new ArgdownEngine(logger, browserConfigLoader);
  const cspArbiter = new ExtensionContentSecurityPolicyArbiter(
    context.globalState,
    context.workspaceState
  );
  const contributions = getArgdownExtensionContributions(context);
  const contentProvider = new ArgdownContentProvider(
    argdownEngine,
    context,
    cspArbiter,
    contributions
  );
  const previewManager = new ArgdownPreviewManager(
    contentProvider,
    logger,
    contributions,
    argdownEngine
  );
  const previewSecuritySelector = new PreviewSecuritySelector(
    cspArbiter,
    previewManager
  );
  const commandManager = new CommandManager();
  context.subscriptions.push(commandManager);
  commandManager.register(new commands.ShowPreviewCommand(previewManager));
  commandManager.register(
    new commands.ShowPreviewToSideCommand(previewManager)
  );
  commandManager.register(
    new commands.ShowLockedPreviewToSideCommand(previewManager)
  );
  commandManager.register(new commands.ShowSourceCommand(previewManager));
  commandManager.register(new commands.RefreshPreviewCommand(previewManager));
  commandManager.register(new commands.MoveCursorToPositionCommand());
  commandManager.register(
    new commands.ShowPreviewSecuritySelectorCommand(
      previewSecuritySelector,
      previewManager
    )
  );
  commandManager.register(new commands.OnPreviewStyleLoadErrorCommand());
  commandManager.register(new commands.OpenDocumentLinkCommand());
  commandManager.register(new commands.ToggleLockCommand(previewManager));
  commandManager.register(new commands.ExportDocumentToHtmlCommand());
  commandManager.register(new commands.ExportDocumentToJsonCommand());
  commandManager.register(new commands.ExportDocumentToDotCommand());
  commandManager.register(new commands.ExportDocumentToGraphMLCommand());
  commandManager.register(new commands.ExportDocumentToVizjsSvgCommand());
  commandManager.register(new commands.CopyWebComponentToClipboardCommand());
  commandManager.register(new commands.ExportDocumentToVizjsPdfCommand());
  commandManager.register(new commands.ExportContentToVizjsPngCommand());
  commandManager.register(new commands.ExportContentToDagreSvgCommand());
  commandManager.register(new commands.ExportContentToDagrePngCommand());
  commandManager.register(new commands.ExportContentToDagrePdfCommand());
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      logger.updateConfiguration();
      previewManager.updateConfiguration();
      if (e.affectsConfiguration("argdown.markdownWebComponent")) {
        vscode.commands.executeCommand("markdown.preview.refresh");
      }
    })
  );
  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: "untitled", language: "argdown" },
      { scheme: "file", language: "argdown" }
    ],
    outputChannelName: "Argdown Language Server"
  };
  logger.log("Starting language server");
  client = createWorkerLanguageClient(context, clientOptions);
  logger.log("language server started");

  const disposable = client.start();
  context.subscriptions.push(disposable);

  return {
    extendMarkdownIt(md: any) {
      const webComponentConfig = vscode.workspace.getConfiguration(
        "argdown.markdownWebComponent",
        null
      );
      const enabled = webComponentConfig.get<boolean>("enabled");
      if (enabled) {
        return md.use(
          createArgdownMarkdownItPlugin(() => {
            const webComponentConfig = vscode.workspace.getConfiguration(
              "argdown.markdownWebComponent",
              null
            );
            const withoutHeader = webComponentConfig.get<boolean>(
              "withoutHeader"
            );
            const withoutLogo = webComponentConfig.get<boolean>("withoutLogo");
            const withoutMaximize = webComponentConfig.get<boolean>(
              "withoutMaximize"
            );
            // const withoutHeader = false;
            // const withoutLogo = false;
            // const withoutMaximize = false;
            return {
              webComponent: {
                addWebComponentScript: false,
                addWebComponentPolyfill: false,
                addGlobalStyles: false,
                withoutHeader,
                withoutLogo,
                withoutMaximize
              }
            };
          })
        );
      }
      return md;
    }
  };
}
export function deactivate(): Thenable<void> {
  if (!client) {
    return Promise.resolve();
  }
  return client.stop();
}
function createWorkerLanguageClient(
  context: ExtensionContext,
  clientOptions: LanguageClientOptions
) {
  // Create a worker. The worker main file implements the language server.
  const serverMain = Uri.joinPath(
    context.extensionUri,
    "node_modules/@argdown/language-server/dist/web/server-browser.js"
  );
  const worker = new Worker(serverMain.toString());

  // create the language server client to communicate with the server running in the worker
  return new LanguageClient(
    "argdown",
    "Argdown Language Server Client",
    clientOptions,
    worker
  );
}
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from "vscode";

// // this method is called when your extension is activated
// // your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {
//   // Use the console to output diagnostic information (console.log) and errors (console.error)
//   // This line of code will only be executed once when your extension is activated
//   console.log(
//     'Congratulations, your extension "helloworld-web-sample" is now active in the web extension host!'
//   );

//   // The command has been defined in the package.json file
//   // Now provide the implementation of the command with registerCommand
//   // The commandId parameter must match the command field in package.json
//   let disposable = vscode.commands.registerCommand(
//     "helloworld-web-sample.helloWorld",
//     () => {
//       // The code you place here will be executed every time your command is executed

//       // Display a message box to the user
//       vscode.window.showInformationMessage(
//         "Hello World from helloworld-web-sample in a web extension host!"
//       );
//     }
//   );

//   context.subscriptions.push(disposable);
// }

// // this method is called when your extension is deactivated
// export function deactivate() {}
