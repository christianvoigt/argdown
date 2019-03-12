import { Hover, Position } from "vscode-languageserver";
import { findNodeAtPosition } from "./findNodeAtPosition";
import {
  generateMarkdownForArgument,
  generateMarkdownForStatement
} from "./utils";
import { IArgdownResponse, isTokenNode } from "@argdown/core";
export const provideHover = (
  response: IArgdownResponse,
  position: Position
) => {
  const line = position.line + 1;
  const character = position.character + 1;
  const nodeAtPosition = findNodeAtPosition(response, line, character);
  if (nodeAtPosition && isTokenNode(nodeAtPosition)) {
    const tokenName = nodeAtPosition.tokenType!.tokenName;
    if (tokenName!.startsWith("Statement")) {
      const eqClass = response.statements![nodeAtPosition.title!];
      return <Hover>{
        contents: generateMarkdownForStatement(eqClass, response)
      };
    } else if (tokenName!.startsWith("Argument")) {
      const argument = response.arguments![nodeAtPosition.title!];
      return <Hover>{
        contents: generateMarkdownForArgument(argument, response)
      };
    } else if (tokenName!.startsWith("Tag") && nodeAtPosition.tag) {
      const tag = nodeAtPosition.tag;
      const statementsStr = Object.keys(response.statements!)
        .map(k => response.statements![k])
        .filter((s: any) => s.tags && s.tags.includes(tag))
        .reduce((acc, val) => `${acc} * [${val.title}]\n`, "");
      const argumentsStr = Object.keys(response.arguments!)
        .map(k => response.arguments![k])
        .filter((a: any) => a.tags && a.tags.includes(tag))
        .reduce((acc, val) => `${acc} * <${val.title}>\n`, "");
      const contents = `**\#(${tag}**)
      
${statementsStr}${argumentsStr}`;
      return <Hover>{
        contents
      };
    }
  }
  return null;
};
