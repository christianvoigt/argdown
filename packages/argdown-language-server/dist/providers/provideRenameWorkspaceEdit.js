"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("./utils");
const findReferences_1 = require("./findReferences");
const findNodeAtPosition_1 = require("./findNodeAtPosition");
const core_1 = require("@argdown/core");
const createTextEdit = (node, newName) => {
    if (core_1.isTokenNode(node) && node.tokenType) {
        switch (node.tokenType.tokenName) {
            case "ArgumentReference":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `<${newName}>`);
            case "ArgumentDefinition":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `<${newName}>:`);
            case "ArgumentMention":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `@<${newName}>`);
            case "StatementReference":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `[${newName}]`);
            case "StatementDefinition":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `[${newName}]:`);
            case "StatementMention":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `@[${newName}]`);
            case "Tag":
                return vscode_languageserver_1.TextEdit.replace(utils_1.createRange(node), `#(${newName})`); // we use the bracketed tag syntax, so we don't have to check the format of newName
        }
    }
    return null;
};
exports.provideRenameWorkspaceEdit = (response, newName, position, textDocument) => {
    const line = position.line + 1;
    const character = position.character + 1;
    const nodeAtPosition = findNodeAtPosition_1.findNodeAtPosition(response, line, character);
    const nodes = findReferences_1.findReferences(response, nodeAtPosition, true);
    if (nodes) {
        const edits = nodes
            .map(n => createTextEdit(n, newName))
            .filter(e => e !== null);
        const wsEdit = {
            changes: {}
        };
        wsEdit.changes[textDocument.uri] = edits;
        return wsEdit;
    }
    return {};
};
//# sourceMappingURL=provideRenameWorkspaceEdit.js.map