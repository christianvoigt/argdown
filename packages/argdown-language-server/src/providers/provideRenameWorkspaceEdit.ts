import { Position, TextDocumentIdentifier, TextEdit, WorkspaceEdit } from "vscode-languageserver";
import { createRange } from "./utils";
import { findReferences } from "./findReferences";
import { findNodeAtPosition } from "./findNodeAtPosition";
import { IAstNode, isTokenNode } from "@argdown/core";
const createTextEdit = (node: IAstNode, newName: string): TextEdit | null => {
  if (isTokenNode(node) && node.tokenType) {
    switch (node.tokenType.tokenName) {
      case "ArgumentReference":
        return TextEdit.replace(createRange(node), `<${newName}>`);
      case "ArgumentDefinition":
        return TextEdit.replace(createRange(node), `<${newName}>:`);
      case "ArgumentMention":
        return TextEdit.replace(createRange(node), `@<${newName}>`);
      case "StatementReference":
        return TextEdit.replace(createRange(node), `[${newName}]`);
      case "StatementDefinition":
        return TextEdit.replace(createRange(node), `[${newName}]:`);
      case "StatementMention":
        return TextEdit.replace(createRange(node), `@[${newName}]`);
      case "Tag":
        return TextEdit.replace(createRange(node), `#(${newName})`); // we use the bracketed tag syntax, so we don't have to check the format of newName
    }
  }
  return null;
};
export const provideRenameWorkspaceEdit = (
  response: any,
  newName: string,
  position: Position,
  textDocument: TextDocumentIdentifier
): WorkspaceEdit => {
  const wsEdit: WorkspaceEdit = {
    changes: {}
  };
  const line = position.line + 1;
  const character = position.character + 1;
  const nodeAtPosition = findNodeAtPosition(response, line, character);
  if (!nodeAtPosition) {
    return wsEdit;
  }
  const nodes: IAstNode[] = findReferences(response, nodeAtPosition, true);
  if (nodes) {
    const edits: TextEdit[] = nodes.reduce<TextEdit[]>((acc, curr) => {
      const edit = createTextEdit(curr, newName);
      if (edit) {
        acc.push(edit);
      }
      return acc;
    }, []);
    wsEdit.changes![textDocument.uri] = edits;
    return wsEdit;
  }
  return {};
};
