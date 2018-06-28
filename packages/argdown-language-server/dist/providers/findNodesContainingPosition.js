"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@argdown/core");
/**
 * Returns an array with all nested nodes containing a position, beginning at the outermost and ending at the innermost.
 *
 * @param response The response from the argdownEngine containing an AST
 * @param line the position's line (one-based). This is one-based so if coming from VS Code, add 1.
 * @param character the position's character. This is one-based so if coming from VS Code, add 1.
 */
exports.findNodesContainingPosition = (nodes, line, character) => {
    let result = [];
    const closestNode = nodes
        .filter(n => {
        // Indent and Dedent are pseudo tokens that mess up the search because of their location information
        return (core_1.isRuleNode(n) ||
            (n.tokenType.tokenName !== core_1.TokenNames.INDENT &&
                n.tokenType.tokenName !== core_1.TokenNames.DEDENT));
    })
        .filter(n => {
        return n.endLine >= line && n.startLine <= line;
    })
        .reduce((acc, val) => {
        if (!acc) {
            return val;
        }
        const valLineDist = line - val.startLine;
        const accLineDist = line - acc.startLine;
        if (valLineDist < accLineDist) {
            return val;
        }
        else if (accLineDist < valLineDist) {
            return acc;
        }
        else {
            // acc & val start at the same line
            if (acc.startLine === line) {
                const valCharDistance = character - val.startColumn;
                const accCharDist = character - acc.startColumn;
                return valCharDistance < accCharDist && valCharDistance >= 0
                    ? val
                    : acc;
            }
            else {
                return val.startColumn > acc.startColumn ? val : acc;
            }
        }
    }, undefined);
    if (closestNode) {
        result.push(closestNode);
        if (core_1.isRuleNode(closestNode) &&
            closestNode.children &&
            closestNode.children.length > 0) {
            result.push(...exports.findNodesContainingPosition(closestNode.children, line, character));
        }
    }
    return result;
};
//# sourceMappingURL=findNodesContainingPosition.js.map