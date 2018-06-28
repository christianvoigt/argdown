"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findNodeAtPosition_1 = require("./findNodeAtPosition");
const utils_1 = require("./utils");
const core_1 = require("@argdown/core");
exports.provideHover = (response, position) => {
    const line = position.line + 1;
    const character = position.character + 1;
    const nodeAtPosition = findNodeAtPosition_1.findNodeAtPosition(response, line, character);
    if (nodeAtPosition && core_1.isTokenNode(nodeAtPosition)) {
        const tokenName = nodeAtPosition.tokenType.tokenName;
        if (tokenName.startsWith("Statement")) {
            const eqClass = response.statements[nodeAtPosition.title];
            return {
                contents: utils_1.generateMarkdownForStatement(eqClass)
            };
        }
        else if (tokenName.startsWith("Argument")) {
            const argument = response.arguments[nodeAtPosition.title];
            return {
                contents: utils_1.generateMarkdownForArgument(argument)
            };
        }
        else if (tokenName.startsWith("Tag") && nodeAtPosition.tag) {
            const tag = nodeAtPosition.tag;
            const statementsStr = Object.keys(response.statements)
                .map(k => response.statements[k])
                .filter((s) => s.tags && s.tags.includes(tag))
                .reduce((acc, val) => `${acc} * [${val.title}]\n`, "");
            const argumentsStr = Object.keys(response.arguments)
                .map(k => response.arguments[k])
                .filter((a) => a.tags && a.tags.includes(tag))
                .reduce((acc, val) => `${acc} * <${val.title}>\n`, "");
            const contents = `**\#(${tag}**)
      
${statementsStr}${argumentsStr}`;
            return {
                contents
            };
        }
    }
    return {};
};
//# sourceMappingURL=provideHover.js.map