import { Position, TextDocumentIdentifier, WorkspaceEdit } from "vscode-languageserver";
export declare const provideRenameWorkspaceEdit: (response: any, newName: string, position: Position, textDocument: TextDocumentIdentifier) => WorkspaceEdit;
