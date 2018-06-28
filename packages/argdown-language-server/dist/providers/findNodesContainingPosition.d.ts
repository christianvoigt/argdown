import { IAstNode } from "@argdown/core";
/**
 * Returns an array with all nested nodes containing a position, beginning at the outermost and ending at the innermost.
 *
 * @param response The response from the argdownEngine containing an AST
 * @param line the position's line (one-based). This is one-based so if coming from VS Code, add 1.
 * @param character the position's character. This is one-based so if coming from VS Code, add 1.
 */
export declare const findNodesContainingPosition: (nodes: IAstNode[], line: number, character: number) => any[];
