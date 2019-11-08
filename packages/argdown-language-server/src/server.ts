"use strict";
import * as path from "path";
import {
  createConnection,
  TextDocuments,
  TextDocument,
  TextDocumentPositionParams,
  Diagnostic,
  DiagnosticSeverity,
  DocumentHighlight,
  Range,
  InitializeParams,
  InitializeResult,
  Location,
  ProposedFeatures,
  RenameParams,
  ReferenceParams,
  TextDocumentIdentifier,
  WorkspaceFolder,
  DocumentSymbolParams,
  FoldingRangeParams
} from "vscode-languageserver";
import { URI } from "vscode-uri";
import { IArgdownSettings } from "./IArgdownSettings";
import {
  exportDocument,
  exportContent,
  ExportContentArgs,
  ExportDocumentArgs
} from "./commands/Export";
import { DocumentSymbolPlugin } from "./providers/DocumentSymbolPlugin";
import {
  provideDefinitions,
  provideReferences,
  provideHover,
  provideCompletion,
  provideRenameWorkspaceEdit
} from "./providers/index";
import { argdown, IArgdownRequest } from "@argdown/node";
import {
  WorkspaceFoldersInitializeParams,
  WorkspaceFoldersClientCapabilities
} from "vscode-languageserver-protocol/lib/protocol.workspaceFolders";
import { ConfigurationClientCapabilities } from "vscode-languageserver-protocol/lib/protocol.configuration";
import { IArgdownResponse } from "@argdown/core";
import { FoldingRangesPlugin } from "./providers/FoldingRangesPlugin";

const EXPORT_CONTENT_COMMAND = "argdown.server.exportContent";
const EXPORT_DOCUMENT_COMMAND = "argdown.server.exportDocument";
const RUN_COMMAND = "argdown.run";

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection = createConnection(ProposedFeatures.all);
let logLevel = "none";
argdown.logger = {
  setLevel: (level: string) => {
    logLevel = level;
  },
  log: (_level: string, message: string) => {
    if (logLevel == "verbose") {
      connection.console.log(message);
    }
  }
};

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
let workspaceFolders: WorkspaceFolder[];

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites.
connection.onInitialize(
  (
    params: InitializeParams & WorkspaceFoldersInitializeParams
  ): InitializeResult => {
    let capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we will fall back using global settings
    hasWorkspaceFolderCapability =
      !!(capabilities as WorkspaceFoldersClientCapabilities).workspace &&
      !!(capabilities as WorkspaceFoldersClientCapabilities).workspace!
        .workspaceFolders;
    hasConfigurationCapability =
      !!(capabilities as ConfigurationClientCapabilities).workspace &&
      !!(capabilities as ConfigurationClientCapabilities).workspace!
        .configuration;

    if (params.workspaceFolders) {
      workspaceFolders = params.workspaceFolders;

      // Sort folders.
      sortWorkspaceFolders();
    }
    return {
      capabilities: {
        // Tell the client that the server works in FULL text document sync mode
        textDocumentSync: documents.syncKind,
        // Tell the client that the server support code complete
        // completionProvider: {
        // 	resolveProvider: true,
        // },
        documentSymbolProvider: true,
        foldingRangeProvider: true,
        // workspaceSymbolProvider: true,
        definitionProvider: true,
        referencesProvider: true,
        documentHighlightProvider: true,
        hoverProvider: true,
        renameProvider: true,
        completionProvider: {
          triggerCharacters: ["[", "<", ":", "#"]
        },
        executeCommandProvider: {
          commands: [
            EXPORT_DOCUMENT_COMMAND,
            EXPORT_CONTENT_COMMAND,
            RUN_COMMAND
          ]
        }
      }
    };
  }
);

connection.onInitialized(() => {
  connection.console.log("Argdown language server initialized.");
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders(event => {
      // Removed folders.
      for (const workspaceFolder of event.removed) {
        const index = workspaceFolders.findIndex(
          folder => folder.uri === workspaceFolder.uri
        );

        if (index !== -1) {
          workspaceFolders.splice(index, 1);
        }
      }

      // Added folders.
      for (const workspaceFolder of event.added) {
        workspaceFolders.push(workspaceFolder);
      }

      // Sort folders.
      sortWorkspaceFolders();
    });
  }
});

function sortWorkspaceFolders() {
  workspaceFolders.sort((folder1, folder2) => {
    let uri1 = folder1.uri.toString();
    let uri2 = folder2.uri.toString();

    if (!uri1.endsWith("/")) {
      uri1 += path.sep;
    }

    if (uri2.endsWith("/")) {
      uri2 += path.sep;
    }

    return uri1.length - uri2.length;
  });
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: IArgdownSettings = {
  configFile: "argdown.config.js"
};
let globalSettings: IArgdownSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<IArgdownSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <IArgdownSettings>(
      (change.settings.lspMultiRootSample || defaultSettings)
    );
  }

  // Revalidate all open text documents
  documents.all().forEach(validateTextDocument);
});

function getDocumentSettings(resource: string): Thenable<IArgdownSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace.getConfiguration({ scopeUri: resource });
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
  documentSettings.delete(e.document.uri);
});
// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
  validateTextDocument(change.document);
});
// The settings interface describe the server relevant settings part
// interface Settings {
// 	lspSample: ExampleSettings;
// }

// These are the example settings we defined in the client's package.json
// file
// interface ExampleSettings {
// 	maxNumberOfProblems: number;
// }

// hold the maxNumberOfProblems setting
//let maxNumberOfProblems: number;
// The settings have changed. Is send on server activation
// as well.

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // let settings = await getDocumentSettings(textDocument.uri);

  let text = textDocument.getText();
  let result = argdown.run({
    process: ["parse-input", "build-model"],
    input: text
  });
  let diagnostics: Diagnostic[] = [];
  if (result.parserErrors && result.parserErrors.length > 0) {
    for (var error of result.parserErrors) {
      var start = {
        line: error.token.startLine! - 1,
        character: error.token.startColumn! - 1
      };
      var end = {
        line: error.token.endLine! - 1,
        character: error.token.endColumn!
      }; //end character is zero based, exclusive
      var range = Range.create(start, end);
      var message = error.message;
      var severity = DiagnosticSeverity.Error;
      var diagnostic = Diagnostic.create(range, message, severity, "argdown");
      diagnostics.push(diagnostic);
    }
  }
  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles(_change => {
  // Monitored files have change in VSCode
  connection.console.log("We recevied an file change event");
});
const processDocForProviders = async (textDocument: TextDocumentIdentifier) => {
  const doc = documents.get(textDocument.uri);
  if (doc) {
    const text = doc.getText();
    const path = URI.parse(textDocument.uri).fsPath;
    return await processTextForProviders(text, path);
  }
  return null;
};
const processTextForProviders = async (text: string, path: string) => {
  const request: IArgdownRequest = {
    input: text,
    inputPath: path,
    process: ["parse-input", "build-model"],
    throwExceptions: true,
    parser: {
      throwExceptions: true
    }
  };
  try {
    return await argdown.runAsync(request);
  } catch (e) {
    return null;
  }
};
connection.onRenameRequest(async (params: RenameParams) => {
  const { newName, position, textDocument } = params;
  const doc = documents.get(textDocument.uri);
  let response: IArgdownResponse | null = null;
  if (doc) {
    response = await processDocForProviders(doc);
  }
  return provideRenameWorkspaceEdit(response, newName, position, textDocument);
});
connection.onHover(async (params: TextDocumentPositionParams) => {
  const { textDocument, position } = params;
  const response = await processDocForProviders(textDocument);
  if (response) {
    return provideHover(response, position);
  }
  return null;
});

const onlyWhitespacePattern = /^\s*$/;
connection.onCompletion(async (params: TextDocumentPositionParams) => {
  const { textDocument, position } = params;
  const path = URI.parse(textDocument.uri).fsPath;
  const doc = documents.get(textDocument.uri);
  if (doc) {
    const txt = doc.getText();
    const offset = doc.offsetAt(position);
    const char = txt.charAt(offset - 1);
    /**
     * --- Dirty Hack: ---
     * We have to check if we are at the end of the document and if char equals ':'.
     * In this case the parser won't produce an ast, but only return a parser error.
     * To avoid this, we have to remove the ':' from the parsed text.
     **/
    let input = txt;
    if (char === ":") {
      const txtAfter = txt.substr(offset);
      if (onlyWhitespacePattern.test(txtAfter)) {
        input = txt.substr(0, offset - 1) + txtAfter;
      }
    }
    const response = await processTextForProviders(input, path);
    if (response) {
      return provideCompletion(response, char, position, txt, offset);
    } else {
      return null;
    }
  }
  return null;
});
connection.onDocumentHighlight(async (params: TextDocumentPositionParams) => {
  const { textDocument, position } = params;
  const response = await processDocForProviders(textDocument);
  if (response) {
    return provideReferences(response, textDocument.uri, position).map(
      (l: Location) => DocumentHighlight.create(l.range, 1)
    );
  }
  return null;
});
connection.onReferences(async (params: ReferenceParams) => {
  const { context, position, textDocument } = params;
  const response = await processDocForProviders(textDocument);
  if (response) {
    return provideReferences(response, textDocument.uri, position, context);
  }
  return null;
});

connection.onDefinition(async (params: TextDocumentPositionParams) => {
  const { textDocument, position } = params;
  const response = await processDocForProviders(textDocument);
  if (response) {
    return provideDefinitions(response, textDocument.uri, position);
  }
  return null;
});

argdown.addPlugin(new DocumentSymbolPlugin(), "add-document-symbols");

connection.onDocumentSymbol(async (params: DocumentSymbolParams) => {
  const path = URI.parse(params.textDocument.uri).fsPath;
  const doc = documents.get(params.textDocument.uri);
  if (doc) {
    const request: IArgdownRequest & { inputUri: string } = {
      inputPath: path,
      input: doc.getText(),
      process: ["parse-input", "build-model", "add-document-symbols"],
      inputUri: params.textDocument.uri,
      parser: {
        throwExceptions: true
      },
      throwExceptions: true
    };
    try {
      const response = await argdown.runAsync(request);
      return response.documentSymbols;
    } catch (e) {
      return null;
    }
  }
  return null;
});

argdown.addPlugin(new FoldingRangesPlugin(), "add-folding-ranges");
connection.onFoldingRanges(async (params: FoldingRangeParams) => {
  const doc = documents.get(params.textDocument.uri);
  if (doc) {
    const request: IArgdownRequest & { inputUri: string } = {
      input: doc.getText(),
      process: ["parse-input", "build-model", "add-folding-ranges"],
      inputUri: params.textDocument.uri,
      parser: {
        throwExceptions: true
      },
      throwExceptions: true
    };
    try {
      const response = await argdown.runAsync(request);
      return response.foldingRanges;
    } catch (e) {
      return null;
    }
  }
  return null;
});
// connection.onWorkspaceSymbol(async (params: WorkspaceSymbolParams) => {
//   const workspaceSymbols: SymbolInformation[] = <SymbolInformation[]>[];
//   const query = params.query;
//   for (var workspaceFolder of workspaceFolders) {
//     const rootPath = URI.parse(workspaceFolder.uri).fsPath;
//     const inputPath = rootPath + "/**/*.{ad,argdown}";
//     const request = {
//       inputPath,
//       process: ["parse-input", "build-model", "add-document-symbols"]
//     };
//     const responses: any[] = await argdown.load(request);
//     const folderSymbols = responses
//       .map<SymbolInformation[]>(r => <SymbolInformation[]>r.documentSymbols)
//       .reduce((acc, val) => acc.concat(val), []);
//     workspaceSymbols.push(...folderSymbols);
//   }
//   return workspaceSymbols.filter(s => s && s.name.indexOf(query) !== -1);
// });
connection.onExecuteCommand(async params => {
  if (params.command === EXPORT_CONTENT_COMMAND) {
    if (!params.arguments) {
      return;
    }
    const args = params.arguments[0] as ExportContentArgs;
    await exportContent(argdown, args);
  } else if (params.command === EXPORT_DOCUMENT_COMMAND) {
    if (!params.arguments) {
      return;
    }
    const args = params.arguments[0] as ExportDocumentArgs;
    const doc = documents.get(args.source.toString());
    await exportDocument(argdown, args, doc);
  } else if (params.command === RUN_COMMAND) {
    if (!workspaceFolders || workspaceFolders.length == 0) {
      connection.console.log("No workspace folder found.");
    }
    for (var workspaceFolder of workspaceFolders) {
      let settings = await getDocumentSettings(workspaceFolder.uri);
      let rootPath = URI.parse(workspaceFolder.uri).fsPath;
      if (!settings.configFile || settings.configFile === "") {
        return;
      }
      let configPath = path.resolve(rootPath, settings.configFile);
      let config = await argdown.loadConfig(configPath);
      if (config !== null) {
        if (!config.rootPath) {
          config.rootPath = rootPath;
        }
        await argdown.load(config);
      }
    }
  }
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
