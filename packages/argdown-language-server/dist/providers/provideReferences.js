"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const findReferences_1 = require("./findReferences");
const findNodeAtPosition_1 = require("./findNodeAtPosition");
exports.provideReferences = (response, uri, position, context) => {
    const line = position.line + 1;
    const character = position.character + 1;
    const includeDeclaration = context ? context.includeDeclaration : true;
    const nodeAtPosition = findNodeAtPosition_1.findNodeAtPosition(response, line, character);
    const nodes = findReferences_1.findReferences(response, nodeAtPosition, includeDeclaration);
    return nodes.map(n => utils_1.createLocation(uri, n));
};
//# sourceMappingURL=provideReferences.js.map