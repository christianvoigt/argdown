import { IArgdownResponse, IAstNode } from "@argdown/core";
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
export declare const findNodeAtPosition: (response: IArgdownResponse, line: number, character: number) => IAstNode;
