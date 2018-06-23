"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const core_1 = require("@argdown/core");
class ArgdownSymbolInformation {
}
exports.ArgdownSymbolInformation = ArgdownSymbolInformation;
const addSymbol = ({}, response, node, name, argdownKind, argdownId) => {
    const symbolInfo = {
        name,
        kind: vscode_languageserver_1.SymbolKind.Variable,
        argdownKind,
        argdownId,
        location: {
            uri: response.inputUri,
            range: {
                start: { line: node.startLine - 1, character: node.startColumn - 1 },
                end: { line: node.endLine - 1, character: node.endColumn }
            }
        }
    };
    response.documentSymbols.push(symbolInfo);
};
exports.documentSymbolsPlugin = {
    name: "DocumentSymbolsPlugin",
    prepare: (request, response) => {
        response.inputUri = vscode_uri_1.default.file(request.inputPath).toString();
    },
    tokenListeners: {
        [core_1.TokenNames.STATEMENT_DEFINITION]: ((request, response, token) => {
            addSymbol(request, response, token, `[${token.title}]`, 2 /* StatementDefinition */, token.title);
        }),
        [core_1.TokenNames.ARGUMENT_DEFINITION]: ((request, response, token) => {
            addSymbol(request, response, token, `<${token.title}>`, 1 /* ArgumentDefinition */, token.title);
        })
    },
    ruleListeners: {
        [core_1.RuleNames.ARGDOWN + "Entry"]: ((_request, response) => {
            response.documentSymbols = [];
        }),
        [core_1.RuleNames.PCS + "Entry"]: ((request, response, node) => {
            addSymbol(request, response, node, `PCS <${node.argument.title}>`, 0 /* PCS */, node.argument.title);
        }),
        [core_1.RuleNames.HEADING + "Entry"]: ((request, response, node) => {
            const sectionId = node.section ? node.section.id : node.text;
            addSymbol(request, response, node, `${node.children[0].image}${node.text}`, 3 /* Heading */, sectionId);
        })
    }
};
//# sourceMappingURL=DocumentSymbolsPlugin.js.map