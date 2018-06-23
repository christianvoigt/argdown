import { Location, Position } from "vscode-languageserver";
import { findNodeAtPosition } from "./findNodeAtPosition";
import { createLocation } from "./utils";
import { findReferences } from "./findReferences";
import { IArgdownResponse, isTokenNode } from "@argdown/core";

export const provideDefinitions = (
  response: IArgdownResponse,
  uri: string,
  position: Position
): Location[] => {
  const line = position.line + 1;
  const character = position.character + 1;
  const nodeAtPosition = findNodeAtPosition(response, line, character);
  if (nodeAtPosition && isTokenNode(nodeAtPosition)) {
    const tokenName = nodeAtPosition.tokenType.tokenName;
    if (tokenName.startsWith("Statement")) {
      // collect locations of all equivalenceClass members
      const equivalenceClass = response.statements[nodeAtPosition.title];
      const definitions: Location[] = equivalenceClass.members.map((m: any) => {
        return createLocation(uri, m);
      });
      return definitions;
    } else if (tokenName.startsWith("Argument")) {
      // collect locations of pcs and all descriptions
      const argument = response.arguments[nodeAtPosition.title];
      const definitions: Location[] = argument.descriptions.map((d: any) => {
        return createLocation(uri, d);
      });
      if (argument.pcs && argument.pcs.length > 0) {
        const pcsLocation: Location = createLocation(uri, argument);
        definitions.push(pcsLocation);
      }
      return definitions;
    } else if (tokenName === "Tag") {
      // We treat each occurrence of a tag as a tag definition
      return findReferences(response, nodeAtPosition, true).map(n =>
        createLocation(uri, n)
      );
    }
  }
  return [];
};
