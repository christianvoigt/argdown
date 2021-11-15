"use strict";

// import * as vscode from "vscode";
import * as vscode from "vscode";
import * as path from "path";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
  ForkOptions
} from "vscode-languageclient/node";
import { CommandManager } from "./commands/CommandManager";
import * as commands from "./commands/index";

import { ArgdownEngine } from "./preview/ArgdownEngine";
import { ArgdownPreviewManager } from "./preview/ArgdownPreviewManager";
import { Logger } from "./preview/Logger";
import { ArgdownContentProvider } from "./preview/ArgdownContentProvider";
import {
  ExtensionContentSecurityPolicyArbiter,
  PreviewSecuritySelector
} from "./preview/security";
import { ArgdownExtensionContributions } from "./preview/ArgdownExtensionContributions";
import createArgdownMarkdownItPlugin from "@argdown/markdown-it-plugin";
// import { ForkOptions } from "vscode-languageclient/lib/client";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  vscode.languages.setLanguageConfiguration("argdown", {
    wordPattern: /([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g
  });
  // -- PREVIEW --
  const logger = new Logger();
  const argdownEngine = new ArgdownEngine(logger);
  const cspArbiter = new ExtensionContentSecurityPolicyArbiter(
    context.globalState,
    context.workspaceState
  );
  const contributions = new ArgdownExtensionContributions();
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
  // --- LANGUGAGE SERVER ---
  // The debug options for the server
  let debugOptions: ForkOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const modulePath = context.asAbsolutePath(
    path.join("node_modules", "@argdown", "language-server")
  );
  let serverOptions: ServerOptions = {
    run: {
      module: modulePath,
      transport: TransportKind.ipc
    },
    debug: {
      module: modulePath,
      transport: TransportKind.ipc,
      options: debugOptions
    }
  };
  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: "untitled", language: "argdown" },
      { scheme: "file", language: "argdown" }
    ],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contain in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc")
      // In the past this told the client to actively synchronize settings. Since the
      // client now supports 'getConfiguration' requests this active synchronization is not
      // necessary anymore.
      // configurationSection: [ 'lspMultiRootSample' ]
    },
    outputChannelName: "Argdown Language Server"
  };
  // Create the language client and start the client.
  client = new LanguageClient(
    "argdownLanguageServer",
    "Argdown Language Server",
    serverOptions,
    clientOptions
  );
  // Register new proposed protocol if available.
  client.registerProposedFeatures();
  // Start the client. This will also launch the server
  client.start();
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
