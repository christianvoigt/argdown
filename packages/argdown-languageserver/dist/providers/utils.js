"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_languageserver_1 = require("vscode-languageserver");
const core_1 = require("@argdown/core");
exports.createLocation = (uri, el) => {
    return vscode_languageserver_1.Location.create(uri, exports.createRange(el));
};
/**
 *  Creates a range from an Argdown node, statement or argument
 * Chevrotain locations have to be transformed to VS Code locations
 **/
exports.createRange = (el) => {
    return vscode_languageserver_1.Range.create((el.startLine || 1) - 1, (el.startColumn || 1) - 1, (el.endLine || 1) - 1, el.endColumn || 1);
};
exports.generateMarkdownForStatement = (eqClass) => {
    let relationsStr = "";
    if (eqClass.relations) {
        for (let relation of eqClass.relations) {
            const isOutgoing = relation.to === eqClass;
            const relationSymbol = getRelationSymbol(relation.relationType, isOutgoing);
            const relationPartner = isOutgoing ? relation.from : relation.to;
            const relationPartnerStr = relationPartner.type === core_1.ArgdownTypes.ARGUMENT
                ? `<${relationPartner.title}>`
                : `[${relationPartner.title}]`;
            relationsStr += `
  ${relationSymbol} ${relationPartnerStr}`;
        }
    }
    return `
\`\`\`argdown
[${eqClass.title}]: ${core_1.IEquivalenceClass.getCanonicalMemberText(eqClass)}${relationsStr}
\`\`\``;
};
exports.generateMarkdownForArgument = (argument) => {
    let relationsStr = "";
    if (argument.relations) {
        for (let relation of argument.relations) {
            const isOutgoing = relation.to === argument;
            const relationSymbol = getRelationSymbol(relation.relationType, isOutgoing);
            const relationPartner = isOutgoing ? relation.from : relation.to;
            const relationPartnerStr = relationPartner.type === core_1.ArgdownTypes.ARGUMENT
                ? `<${relationPartner.title}>`
                : `[${relationPartner.title}]`;
            relationsStr += `
  ${relationSymbol} ${relationPartnerStr}`;
        }
    }
    let desc = core_1.IArgument.getCanonicalDescriptionText(argument);
    if (desc) {
        desc = ":" + desc;
    }
    return `
\`\`\`argdown
<${argument.title}>${desc}${relationsStr}
\`\`\``;
};
const relationSymbols = {
    support: "+",
    attack: "-",
    entails: "+",
    contrary: "-",
    undercut: "_",
    contradictory: "><"
};
const getRelationSymbol = (relationType, isOutgoing) => {
    let symbol = relationSymbols[relationType];
    if (relationType !== "contradictory") {
        if (isOutgoing) {
            symbol = `<${symbol}`;
        }
        else {
            symbol = `${symbol}>`;
        }
    }
    return symbol;
};
exports.walkTree = (node, parentNode, childIndex, callback) => {
    callback(node, parentNode, childIndex);
    if (core_1.isRuleNode(node) && node.children && node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
            let child = node.children[i];
            exports.walkTree(child, node, i, callback);
        }
    }
};
//# sourceMappingURL=utils.js.map