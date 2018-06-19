import { IStatement, IEquivalenceClass, IArgument, IMapEdge, IRelation, IAstNode, IRuleNode, ITokenNode, IConclusion, IArgumentStatement } from "./model";
import { RuleNames } from "../RuleNames";
/**
 * Provides a default statement that can be used to reqpresent this equivalence class.
 * The statement chosen is the one that occurs last in the Argdown source code.
 */
export declare const getCanonicalMember: (ec: IEquivalenceClass) => IStatement | undefined;
/**
 * Convenience method that directly returns the text of the equivalence class's canonical statement.
 */
export declare const getCanonicalMemberText: (ec: IEquivalenceClass) => string | undefined;
/**
 * Provides a default description.
 * Chooses the last description defined in the Argdown source code.
 */
export declare const getCanonicalDescription: (a: IArgument) => IStatement | undefined;
export declare const getCanonicalDescriptionText: (a: IArgument) => string | undefined;
export declare const edgeToString: (e: IMapEdge) => string;
export declare const relationToString: (r: IRelation) => string;
export declare const createRuleNode: (name: RuleNames, children: IAstNode[]) => IRuleNode;
export declare const isRuleNode: (n: IAstNode) => n is IRuleNode;
export declare const isTokenNode: (n: IAstNode) => n is ITokenNode;
export declare const createEquivalenceClass: (title: string) => IEquivalenceClass;
export declare const isReconstructed: (a: IArgument) => boolean;
export declare const isConclusion: (s: IStatement) => s is IConclusion;
export declare const isArgumentStatement: (s: IStatement) => s is IArgumentStatement;
