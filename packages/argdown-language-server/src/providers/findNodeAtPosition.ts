import { findNodesContainingPosition } from "./findNodesContainingPosition";
import {
  TokenNames,
  IArgdownResponse,
  IRuleNode,
  IAstNode
} from "@argdown/core";
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
export const findNodeAtPosition = (
  response: IArgdownResponse,
  line: number,
  character: number
): IAstNode | null => {
  if (!response || !response.ast || !(<IRuleNode>response.ast!).children) {
    return null;
  }
  var children = (<IRuleNode>response.ast!).children!;
  const containingNodes: any[] = findNodesContainingPosition(
    children,
    line,
    character
  );
  return containingNodes.reverse().find(n => {
    if (!n.tokenType) {
      return false;
    }
    switch (n.tokenType.tokenName) {
      case TokenNames.STATEMENT_REFERENCE:
      case TokenNames.STATEMENT_DEFINITION:
      case TokenNames.STATEMENT_MENTION:
      case TokenNames.ARGUMENT_REFERENCE:
      case TokenNames.ARGUMENT_DEFINITION:
      case TokenNames.ARGUMENT_MENTION:
      case TokenNames.TAG:
        return true;
    }
    return false;
  });
};
