import { TokenNames, IAstNode, isRuleNode } from "@argdown/core";

/**
 * Returns an array with all nested nodes containing a position, beginning at the outermost and ending at the innermost.
 *
 * @param response The response from the argdownEngine containing an AST
 * @param line the position's line (one-based). This is one-based so if coming from VS Code, add 1.
 * @param character the position's character. This is one-based so if coming from VS Code, add 1.
 */
export const findNodesContainingPosition = (
  nodes: IAstNode[],
  line: number,
  character: number
): any[] => {
  let result = [];
  const closestNode = nodes
    .filter(n => {
      // Indent and Dedent are pseudo tokens that mess up the search because of their location information
      return (
        isRuleNode(n) ||
        (n.tokenType!.name !== TokenNames.INDENT &&
          n.tokenType!.name !== TokenNames.DEDENT)
      );
    })
    .filter(n => {
      return n.endLine! >= line && n.startLine! <= line;
    })
    .reduce((acc: IAstNode | undefined, val) => {
      if (!acc) {
        return val;
      }
      const valLineDist = line - val.startLine!;
      const accLineDist = line - acc.startLine!;
      if (valLineDist < accLineDist) {
        return val;
      } else if (accLineDist < valLineDist) {
        return acc;
      } else {
        // acc & val start at the same line
        if (acc.startLine === line) {
          const valCharDistance = character - val.startColumn!;
          const accCharDist = character - acc.startColumn!;
          return valCharDistance < accCharDist && valCharDistance >= 0
            ? val
            : acc;
        } else {
          return val.startColumn! > acc.startColumn! ? val : acc;
        }
      }
    }, undefined);
  if (closestNode) {
    result.push(closestNode);
    if (
      isRuleNode(closestNode) &&
      closestNode.children &&
      closestNode.children.length > 0
    ) {
      result.push(
        ...findNodesContainingPosition(closestNode.children, line, character)
      );
    }
  }
  return result;
};
