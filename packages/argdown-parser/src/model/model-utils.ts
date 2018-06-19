import {
  IStatement,
  IEquivalenceClass,
  IArgument,
  IMapEdge,
  IMapNode,
  IRelation,
  ISection,
  ArgdownTypes,
  IAstNode,
  IRuleNode,
  ITokenNode,
  IConclusion,
  StatementRole,
  IArgumentStatement
} from "./model";
import { RuleNames } from "../RuleNames";

/**
 * Provides a default statement that can be used to reqpresent this equivalence class.
 * The statement chosen is the one that occurs last in the Argdown source code.
 */
export const getCanonicalMember = (ec: IEquivalenceClass): IStatement | undefined => {
  if (!ec.members || ec.members.length <= 0) {
    return undefined;
  }
  for (let i = ec.members.length - 1; i >= 0; i--) {
    const current = ec.members[i];
    if (!current.isReference) {
      return current;
    }
  }
};
/**
 * Convenience method that directly returns the text of the equivalence class's canonical statement.
 */
export const getCanonicalMemberText = (ec: IEquivalenceClass): string | undefined => {
  let statement = getCanonicalMember(ec);
  if (statement) {
    return statement.text;
  }
};
/**
 * Provides a default description.
 * Chooses the last description defined in the Argdown source code.
 */
export const getCanonicalDescription = (a: IArgument): IStatement | undefined => {
  if (!a.descriptions || a.descriptions.length <= 0) {
    return undefined;
  }
  return a.descriptions[a.descriptions.length - 1];
};
export const getCanonicalDescriptionText = (a: IArgument): string | undefined => {
  const s = getCanonicalDescription(a);
  if (s) {
    return s.text;
  }
};
export const edgeToString = (e: IMapEdge) => {
  return `Edge(type: ${e.type} from: ${e.from.title} to: ${e.to.title})`;
};
export const relationToString = (r: IRelation) => {
  return `Relation(from: ${r.from!.title}, to: ${r.to!.title}, type: ${r.type})`;
};
export const createRuleNode = (name: RuleNames, children: IAstNode[]): IRuleNode => {
  const firstChild = children[0];
  const lastChild = children[children.length - 1];
  return {
    type: ArgdownTypes.RULE_NODE,
    name,
    startLine: firstChild.startLine,
    startColumn: firstChild.startColumn,
    endLine: lastChild.endLine,
    endColumn: lastChild.endColumn,
    children
  };
};
export const isRuleNode = (n: IAstNode): n is IRuleNode => {
  return (<IRuleNode>n).type === ArgdownTypes.RULE_NODE;
};
export const isTokenNode = (n: IAstNode): n is ITokenNode => {
  return !(<any>n).type && (<ITokenNode>n).tokenType != null;
};
export const createEquivalenceClass = (title: string): IEquivalenceClass => {
  return <IEquivalenceClass>{
    type: ArgdownTypes.EQUIVALENCE_CLASS,
    title,
    relations: [],
    members: []
  };
};
export const isReconstructed = (a: IArgument): boolean => {
  return a.pcs !== undefined && a.pcs.length > 0;
};
export const isConclusion = (s: IStatement): s is IConclusion => {
  return (
    (s.role === StatementRole.PRELIMINARY_CONCLUSION || s.role === StatementRole.MAIN_CONCLUSION) &&
    (<IConclusion>s).inference != undefined
  );
};
export const isArgumentStatement = (s: IStatement): s is IArgumentStatement => {
  return (
    s.role === StatementRole.PREMISE ||
    s.role === StatementRole.PRELIMINARY_CONCLUSION ||
    s.role == StatementRole.MAIN_CONCLUSION
  );
};
