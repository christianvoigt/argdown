"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findNodesContainingPosition_1 = require("./findNodesContainingPosition");
const core_1 = require("@argdown/core");
/**
 *
 * Returns the smallest node containing the position, if the node is of one of the following types:
 * * ArgumentReference
 * * ArgumentDefinition
 * * ArgumentMention
 * * StatementReference
 * * StatementDefinition
 * * StatementMention
 * * Tag
 *
 * Otherwise returns null.
 *
 * @param response The response from the argdownEngine containing an AST
 * @param line the position's line (one-based). This is one-based so if coming from VS Code, add 1.
 * @param character the position's character. This is one-based so if coming from VS Code, add 1.
 */
exports.findNodeAtPosition = (response, line, character) => {
    const containingNodes = findNodesContainingPosition_1.findNodesContainingPosition(response.ast.children, line, character);
    return containingNodes.reverse().find(n => {
        if (!n.tokenType) {
            return false;
        }
        switch (n.tokenType.tokenName) {
            case core_1.TokenNames.STATEMENT_REFERENCE:
            case core_1.TokenNames.STATEMENT_DEFINITION:
            case core_1.TokenNames.STATEMENT_MENTION:
            case core_1.TokenNames.ARGUMENT_REFERENCE:
            case core_1.TokenNames.ARGUMENT_DEFINITION:
            case core_1.TokenNames.ARGUMENT_MENTION:
            case core_1.TokenNames.TAG:
                return true;
        }
        return false;
    });
};
//# sourceMappingURL=findNodeAtPosition.js.map