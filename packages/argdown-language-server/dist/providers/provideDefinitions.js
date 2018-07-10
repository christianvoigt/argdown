"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findNodeAtPosition_1 = require("./findNodeAtPosition");
const utils_1 = require("./utils");
const findReferences_1 = require("./findReferences");
const core_1 = require("@argdown/core");
exports.provideDefinitions = (response, uri, position) => {
    const line = position.line + 1;
    const character = position.character + 1;
    const nodeAtPosition = findNodeAtPosition_1.findNodeAtPosition(response, line, character);
    if (nodeAtPosition && core_1.isTokenNode(nodeAtPosition)) {
        const tokenName = nodeAtPosition.tokenType.tokenName;
        if (tokenName.startsWith("Statement")) {
            // collect locations of all equivalenceClass members
            const equivalenceClass = response.statements[nodeAtPosition.title];
            const definitions = equivalenceClass.members.filter(m => !m.isReference).map(m => {
                return utils_1.createLocation(uri, m);
            });
            return definitions;
        }
        else if (tokenName.startsWith("Argument")) {
            // collect locations of pcs and all descriptions
            const argument = response.arguments[nodeAtPosition.title];
            const definitions = argument.members.filter(m => !m.isReference).map(m => {
                return utils_1.createLocation(uri, m);
            });
            if (argument.pcs && argument.pcs.length > 0) {
                const pcsLocation = utils_1.createLocation(uri, argument);
                definitions.push(pcsLocation);
            }
            return definitions;
        }
        else if (tokenName === "Tag") {
            // We treat each occurrence of a tag as a tag definition
            return findReferences_1.findReferences(response, nodeAtPosition, true).map(n => utils_1.createLocation(uri, n));
        }
    }
    return [];
};
//# sourceMappingURL=provideDefinitions.js.map