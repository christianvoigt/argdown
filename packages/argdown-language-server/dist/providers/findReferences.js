"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const core_1 = require("@argdown/core");
/**
 * Finds all references in an Argdown AST to statements, arguments and tags.
 * For statements and arguments this includes definitions, references and mentions.
 **/
exports.findReferences = (response, nodeAtPosition, includeDeclaration) => {
    const references = [];
    if (nodeAtPosition && core_1.isTokenNode(nodeAtPosition)) {
        const refersToStatement = nodeAtPosition.tokenType.tokenName.startsWith("Statement");
        const refersToArgument = nodeAtPosition.tokenType.tokenName.startsWith("Argument");
        const refersToTag = nodeAtPosition.tokenType.tokenName === core_1.TokenNames.TAG;
        // const isArgument = nodeAtPosition.tokenType.tokenName.startsWith(
        //   "Argument"
        // );
        let tokenStart;
        let nodeId;
        if (refersToStatement) {
            nodeId = nodeAtPosition.title;
            tokenStart = "Statement";
        }
        else if (refersToArgument) {
            nodeId = nodeAtPosition.title;
            tokenStart = "Argument";
        }
        else if (refersToTag) {
            tokenStart = "Tag";
            nodeId = nodeAtPosition.tag;
        }
        utils_1.walkTree(response.ast, null, 0, (node) => {
            if (core_1.isTokenNode(node) &&
                node.tokenType &&
                node.tokenType.tokenName.startsWith(tokenStart)) {
                let matches = false;
                if (refersToArgument || refersToStatement) {
                    matches = node.title === nodeId;
                }
                else if (refersToTag) {
                    matches = node.tag === nodeId;
                }
                if (matches &&
                    (includeDeclaration ||
                        !node.tokenType.tokenName.endsWith("Definition"))) {
                    references.push(node);
                }
            }
            // if (
            //   isArgument &&
            //   node.name === "argument" &&
            //   node.argument.title === title &&
            //   includeDeclaration
            // ) {
            //   references.push(node);
            // }
        });
    }
    return references;
};
//# sourceMappingURL=findReferences.js.map