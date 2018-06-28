import { IArgdownResponse, IAstNode } from "@argdown/core";
/**
 * Finds all references in an Argdown AST to statements, arguments and tags.
 * For statements and arguments this includes definitions, references and mentions.
 **/
export declare const findReferences: (response: IArgdownResponse, nodeAtPosition: IAstNode, includeDeclaration: boolean) => IAstNode[];
