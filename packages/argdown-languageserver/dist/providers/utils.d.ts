import { Location, Range } from "vscode-languageserver";
import { IAstNode, IEquivalenceClass, HasLocation } from "@argdown/core";
export declare const createLocation: (uri: string, el: HasLocation) => Location;
/**
 *  Creates a range from an Argdown node, statement or argument
 * Chevrotain locations have to be transformed to VS Code locations
 **/
export declare const createRange: (el: HasLocation) => Range;
export declare const generateMarkdownForStatement: (eqClass: IEquivalenceClass) => string;
export declare const generateMarkdownForArgument: (argument: any) => string;
export declare const walkTree: (node: IAstNode, parentNode: any, childIndex: number, callback: (node: any, parentNode: any, childIndex: number) => void) => void;
