"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const core_1 = require("@argdown/core");
const statementPattern = /\[([^\[]+?)\]$/;
const argumentPattern = /<([^<]+?)>$/;
exports.provideCompletion = (response, char, position, text, offset) => {
    const range = vscode_languageserver_1.Range.create(position.line, position.character - 1, position.line, position.character + 1);
    if (char === "[") {
        return Object.keys(response.statements).map((k) => {
            const eqClass = response.statements[k];
            const title = eqClass.title;
            const item = vscode_languageserver_1.CompletionItem.create(`[${title}]`);
            item.textEdit = vscode_languageserver_1.TextEdit.replace(range, `[${title}]`);
            item.kind = vscode_languageserver_1.CompletionItemKind.Variable;
            item.detail = core_1.IEquivalenceClass.getCanonicalMemberText(eqClass);
            return item;
        });
    }
    else if (char === "<") {
        return Object.keys(response.arguments).map((k) => {
            const argument = response.arguments[k];
            const title = argument.title;
            const item = vscode_languageserver_1.CompletionItem.create(`<${title}>`);
            item.textEdit = vscode_languageserver_1.TextEdit.replace(range, `<${title}>`);
            item.kind = vscode_languageserver_1.CompletionItemKind.Variable;
            const desc = core_1.IArgument.getCanonicalMemberText(argument);
            if (desc) {
                item.detail = desc;
            }
            return item;
        });
    }
    else if (char === ":") {
        const textBefore = text.slice(0, offset - 1);
        const statementMatch = textBefore.match(statementPattern);
        if (statementMatch && statementMatch.length > 1) {
            const title = statementMatch[1];
            const eqClass = response.statements[title];
            return eqClass.members.filter(member => !member.isReference).map(member => {
                const item = vscode_languageserver_1.CompletionItem.create(member.text);
                item.kind = vscode_languageserver_1.CompletionItemKind.Value;
                item.detail = `[${title}]: ${member.text}`;
                item.insertText = ` ${member.text}
`;
                return item;
            });
        }
        else {
            const argumentMatch = textBefore.match(argumentPattern);
            if (argumentMatch && argumentMatch.length > 1) {
                const title = argumentMatch[1];
                const argument = response.arguments[title];
                if (argument.members) {
                    return argument.members.filter(member => !member.isReference).map(member => {
                        const item = vscode_languageserver_1.CompletionItem.create(member.text);
                        item.kind = vscode_languageserver_1.CompletionItemKind.Value;
                        item.detail = `<${title}>: ${member.text}`;
                        item.insertText = ` ${member.text}
`;
                        item.kind = vscode_languageserver_1.CompletionItemKind.Value;
                        return item;
                    });
                }
            }
        }
    }
    else if (char === "#" && response.tags) {
        return Object.keys(response.tags).map((t) => {
            const item = vscode_languageserver_1.CompletionItem.create(`#(${t})`);
            item.insertText = `(${t})`;
            item.kind = vscode_languageserver_1.CompletionItemKind.Keyword;
            return item;
        });
    }
    return [];
};
//# sourceMappingURL=provideCompletion.js.map