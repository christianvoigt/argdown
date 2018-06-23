import { Location, Position, ReferenceContext } from "vscode-languageserver";
import { createLocation } from "./utils";
import { findReferences } from "./findReferences";
import { findNodeAtPosition } from "./findNodeAtPosition";
import { IArgdownResponse } from "@argdown/core";

export const provideReferences = (
  response: IArgdownResponse,
  uri: string,
  position: Position,
  context?: ReferenceContext
): Location[] => {
  const line = position.line + 1;
  const character = position.character + 1;
  const includeDeclaration = context ? context.includeDeclaration : true;
  const nodeAtPosition = findNodeAtPosition(response, line, character);
  const nodes = findReferences(response, nodeAtPosition, includeDeclaration);
  return nodes.map(n => createLocation(uri, n));
};
