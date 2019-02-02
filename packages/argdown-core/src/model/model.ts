import { RuleNames } from "../RuleNames";
import { IToken } from "chevrotain";

/**
 * All data objects stored in the [[IArgdownResponse]] are simple object literals implementing an interface.
 * You can simply instantiate an argument, statement or relation by creating an object literal and adding properties to it.
 *
 * To support runtime type checking, each of these objects has a required `obj.type` property with its own ArgdownTypes member as type.
 * Typescript will automatically narrow the type if you check if some object's type property is equal to a specific ArgdownTypes member.
 *
 * @example
 * ```javascript
 * // Instantiate a new statement by using an object literal:
 * const obj = {
 *  type: ArgdownTypes.STATEMENT,
 *  title: "Some title",
 *  text: "Some text"
 * }
 *
 * if(obj.type === ArgdownTypes.STATEMENT){
 *  // Because IStatement is the only type with ArgdownTypes.STATEMENT as type of its `type`property
 *  // Typescript will now know that obj is of type IStatement, you don't have to cast it explicitely.
 *  obj.tags = ["some tag"];
 *  obj.role = StatementRole.PREMISE;
 * }
 * ```
 */
export enum ArgdownTypes {
  EQUIVALENCE_CLASS = "equivalence-class",
  STATEMENT = "statement",
  STATEMENT_REFERENCE = "statement-reference",
  ARGUMENT = "argument",
  RELATION = "relation",
  INFERENCE = "inference",
  STATEMENT_MAP_NODE = "statement-map-node",
  ARGUMENT_MAP_NODE = "argument-map-node",
  GROUP_MAP_NODE = "group-map-node",
  MAP_EDGE = "map-edge",
  SECTION = "section",
  RULE_NODE = "rule-node",
  TOKEN_NODE = "token-node"
}

/**
 * The relation types of the Argdown syntax used in [[IRelation.relationType]].
 *
 * Note that ATTACK/CONTRARY and SUPPORT/ENTAILS are using the same relations symbols (- and +).
 * The difference lies in the source and target of the relations: attack and support relations
 * are dialectical relations from an argument/statement to an argument.
 *
 * An UNDERCUT is a dialectical relation between an argument/statement to an inference of an argument.
 *
 * ENTAILS, CONTRARY and CONTRADICTORY are logical relations between two statements.
 * Dialectical support and attack relations can be derived from logical statement-to-statement relations
 * if these statements are used as premises or main conclusions in arguments.
 *
 * Logical equivalence between statements is missing from this list of relation types because it is not modeled as an [[IRelation]],
 * but instead as an [[IEquivalenceClass]].
 *
 */
export enum RelationType {
  ATTACK = "attack",
  SUPPORT = "support",
  ENTAILS = "entails",
  CONTRARY = "contrary",
  CONTRADICTORY = "contradictory",
  UNDERCUT = "undercut"
}
/**
 * A formatted range of text.
 *
 * Used to save information about ranges containing bold and italic text, a mention, link or a tag.
 */
export interface IRange {
  type: RangeType;
  start: number;
  stop: number;
  title?: string;
  url?: string;
  tag?: string;
}
export enum RangeType {
  BOLD = "bold",
  ITALIC = "italic",
  LINK = "link",
  TAG = "tag",
  STATEMENT_MENTION = "statement-mention",
  ARGUMENT_MENTION = "argument-mention"
}
export interface HasTitle {
  title?: string;
}
export interface HasText {
  text?: string;
  ranges?: IRange[];
}
export interface HasRelations {
  relations?: IRelation[];
}
export interface HasTags {
  tags?: string[];
}
export interface HasData {
  data?: any;
}
export interface HasLocation {
  startLine?: number;
  endLine?: number;
  startOffset?: number;
  endOffset?: number;
  startColumn?: number;
  endColumn?: number;
}
export interface HasSection {
  section?: ISection | null;
}
export interface HasColor {
  color?: string;
}
export interface HasFontColor {
  fontColor?: string;
}
/**
 * Represents a matched Argdown syntax rule in the abstract syntax tree produced by the [[ParserPlugin]].
 * Has either other [[IRuleNode]]s or [[ITokenNode]]s as children.
 */
export interface IRuleNode
  extends HasLocation,
    HasData,
    HasText,
    HasTags,
    HasTitle {
  type: ArgdownTypes.RULE_NODE;
  name: RuleNames;
  children?: IAstNode[];
  statement?: IStatement;
  statementNr?: number;
  level?: number;
  section?: ISection;
  argument?: IArgument;
  relation?: IRelation;
  equivalenceClass?: IEquivalenceClass;
  inference?: IInference;
  trailingWhitespace?: string;
}
export namespace IRuleNode {
  export const create = (name: RuleNames, children: IAstNode[]): IRuleNode => {
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
}
/**
 * Represents a matched Argdown token in the abstract syntax tree produced by the [[ParserPlugin]].
 */
export interface ITokenNode extends IToken, HasTitle, HasData, HasText {
  trailingWhitespace?: string;
  url?: string;
  tag?: string;
}
/**
 * A node in the abstract syntax tree produced by the [[ParserPlugin]]
 */
export type IAstNode = IRuleNode | ITokenNode;
/**
 * Argument with an optional premise-conclusion-structure (pcs)
 *
 * If the argument has a premise-conclusion-structure,
 * all outgoing relations that were defined for this argument
 * are transformed by the [[ModelPlugin]] into relations of the argument's main conclusion
 * (the last statement in the argument's pcs).
 */
export interface IArgument
  extends HasTitle,
    HasRelations,
    HasTags,
    HasData,
    HasLocation,
    HasSection,
    HasColor,
    HasFontColor {
  type: ArgdownTypes.ARGUMENT;
  /**
   * If the argument was logically reconstructed, it has a premise conclusion structure (pcs).
   * A pcs consists of a statement list (not a list of equivalence classes)
   * in which each statement plays either the role of "premise" or "conclusion".
   * Using statements makes it possible to save argument-specific data in the statements:
   * This is used to save the role of the statement in this argument. It is either a PREMISE, INTERMEDIARY_CONCLUSION or MAIN_CONCLUSION.
   * Statements that have the role of a conclusion in the argument possess an inference property.
   */
  pcs: IPCSStatement[];
  /**
   * All argument definitions and references with the same title are stored as "descriptions" of the same argument
   * and are stored in the members array.
   *
   * These statements are not members of any equivalence class,
   * have no logical relations and do not exist in the model apart from the argument.
   *
   * Argument references are stored as descriptions without text and with [[IArgumentDescription.isReference]] set to true.
   *
   * If a pcs was defined directly after an argument description, it will be stored in [[IArgumentDescription.pcs]].
   */
  members: IArgumentDescription[];
}
export namespace IArgument {
  /**
   * Provides a default description.
   * Chooses the last description defined in the Argdown source code that is not a reference.
   */
  export const getCanonicalMember = (a: IArgument): IStatement | undefined => {
    if (!a.members || a.members.length <= 0) {
      return undefined;
    }
    let defaultCanonical = undefined;
    for (let i = a.members.length - 1; i >= 0; i--) {
      const current = a.members[i];
      if (!current.isReference) {
        if (current.data && current.data.isCanonical) {
          return current;
        }
        if (!defaultCanonical) {
          defaultCanonical = current;
        }
      }
    }
    return defaultCanonical;
  };
  export const getCanonicalMemberText = (a: IArgument): string | undefined => {
    const s = getCanonicalMember(a);
    if (s) {
      return s.text;
    }
    return;
  };
}

/**
 * Each statement represents a paragraph of text in the original Argdown source code.
 * Statements are thus not "propositions" in the philosophical sense or "strings" in the computational sense.
 * Instead they represent string occurrences in a document.
 *
 * Each statement that is not an argument description, belongs to exactly one [[IEquivalenceClass]], identified by the statement's title.
 * If no title was defined, a title is automatically generated.
 *
 * If the statement has the role [[StatementRole.ARGUMENT_DESCRIPTION]] and the statement's title will refer to an argument instead of an equivalence class.
 * See [[IARgumentDescription]].
 *
 * Statement and argument references are also stored as IStatement objects. The only differences are that they have no text and that `isReference` is true.
 *
 * For further details on the relationship between equivalence classes and statements, see [[IEquivalenceClass]].
 */
export interface IStatement
  extends HasTitle,
    HasTags,
    HasData,
    HasLocation,
    HasSection,
    HasText {
  type: ArgdownTypes.STATEMENT;
  role?: StatementRole;
  isReference?: boolean;
}
/**
 * The role of a statement occurrence in an Argdown document.
 *
 * If the statement is used in an argument's premise conclusion structure
 * it is either a PREMISE, INTERMEDIARY_CONCLUSION or a CONCLUSION.
 *
 * If it is used to describe an argument in an argument definition, it is an ARGUMENT_DESCRIPTION.
 *
 * If it is used to define a relation it is a RELATION_STATEMENT and
 * if it is a standalone paragraph within the Argdown text it is a TOP_LEVEL_STATEMENT.
 */
export enum StatementRole {
  PREMISE = "premise",
  INTERMEDIARY_CONCLUSION = "intermediary-conclusion",
  MAIN_CONCLUSION = "main-conclusion",
  ARGUMENT_DESCRIPTION = "argument-description",
  TOP_LEVEL_STATEMENT = "top-level-statement",
  RELATION_STATEMENT = "relation-statement"
}
/**
 * A statement used within an argument's premise-conclusion-structure ([[IArgument.pcs]])
 */
export interface IPCSStatement extends IStatement {
  role:
    | StatementRole.PREMISE
    | StatementRole.MAIN_CONCLUSION
    | StatementRole.INTERMEDIARY_CONCLUSION;
  argumentTitle?: string;
}
/**
 * A statement used as conclusion within an argument's premise-conclusion-structure ([[IArgument.pcs]])
 */
export interface IConclusion extends IPCSStatement {
  role: StatementRole.INTERMEDIARY_CONCLUSION | StatementRole.MAIN_CONCLUSION;
  inference?: IInference;
}
export interface IArgumentDescription extends IStatement {
  role: StatementRole.ARGUMENT_DESCRIPTION;
  pcs?: IPCSStatement[];
}
/**
 * Argdown statements are automatically grouped into equivalence classes by using their titles as identifiers.
 * All member statements of such a class are considered to be logically equivalent (as essentially meaning the same).
 *
 * Each [[Statement]] (apart from argument descriptions) belongs to one and only one equivalence class.
 *
 * Statements for which no title is defined will be given an automatically generated one and will
 * belong to an equivalence class with only one member.
 *
 * Statements in Argdown are basically string occurrences, not strings.
 * This means that for each time a statement is defined with a certain title and text in the Argdown source code,
 * there will be a separate member in the equivalence class with this title.
 * This makes it possible to save occurrence-specific data with each statement (e.g. its location in the text).
 *
 * The relations/tags of an equivalence class are the union set of all relations/tags of the class members.
 * Logical relations with other statements can be of type: entails, contrary, contradictory
 * Dialectical relations with arguments or inferences can be of type: support, attack, undercut.
 *
 */
export interface IEquivalenceClass
  extends HasTitle,
    HasRelations,
    HasTags,
    HasData,
    HasLocation,
    HasSection,
    HasColor,
    HasFontColor {
  type: ArgdownTypes.EQUIVALENCE_CLASS;
  /**
   * The statements that share the title with this equivalence class and are considered to be logically equivalent.
   * See the description of this class for further details.
   */
  members: IStatement[];
  /**
   * is true if any member statement is used as a premise in an argument's pcs
   */
  isUsedAsPremise?: boolean;
  /**
   * is true if any member statement is used as a main conclusion in an argument's pcs
   */
  isUsedAsMainConclusion?: boolean;
  /**
   * is true if any member statement is used as a main conclusion in an argument's pcs
   */
  isUsedAsIntermediaryConclusion?: boolean;
  /**
   * is true if any member statement is used as top level element (as child of the argdown rule)
   */
  isUsedAsTopLevelStatement?: boolean;
  /**
   * is true if any member statement is used as content of a relation (will ignore references)
   */
  isUsedAsRelationStatement?: boolean;
}
export namespace IEquivalenceClass {
  export const create = (title: string): IEquivalenceClass => {
    return <IEquivalenceClass>{
      type: ArgdownTypes.EQUIVALENCE_CLASS,
      title,
      relations: [],
      members: []
    };
  };
  /**
   * Provides a default statement that can be used to reqpresent this equivalence class.
   * The statement chosen is the one that occurs last in the Argdown source code.
   */
  export const getCanonicalMember = (
    ec: IEquivalenceClass
  ): IStatement | undefined => {
    if (!ec.members || ec.members.length <= 0) {
      return undefined;
    }
    let defaultCanonical = undefined;
    for (let i = ec.members.length - 1; i >= 0; i--) {
      const current = ec.members[i];
      if (!current.isReference) {
        if (current.data && current.data.isCanonical) {
          return current;
        }
        if (!defaultCanonical) {
          defaultCanonical = current;
        }
      }
    }
    return defaultCanonical;
  };
  /**
   * Convenience method that directly returns the text of the equivalence class's canonical statement.
   */
  export const getCanonicalMemberText = (
    ec: IEquivalenceClass
  ): string | undefined => {
    let statement = getCanonicalMember(ec);
    if (statement) {
      return statement.text;
    }
    return;
  };
}
/**
 * An inference in an argument's premise-conclusion-structure (pcs).
 * To keep the pcs simple, inferences are stored as property of the conclusion statement that is inferred.
 * Thus, the last statement of a pcs will always be a conclusion containing an inference.
 *
 * Inferences can be identified by their argument's title and their conclusion's index in the argument's pcs.
 */
export interface IInference
  extends HasTitle,
    HasRelations,
    HasData,
    HasLocation,
    HasSection {
  type: ArgdownTypes.INFERENCE;
  inferenceRules?: string[];
  /**
   * The title of the argument of whose pcs this inference is a part of
   */
  argumentTitle?: string;
  /**
   * The pcs index of the conclusion containing this inference
   */
  conclusionIndex?: number;
}
/**
 * The data types that can be either source or target of a relation.
 *
 * Note that [[IInference]] can only be a relation target and never be a relation source.
 */
export type RelationMember = IArgument | IEquivalenceClass | IInference;

/**
 * Represents a relation between two Argdown elements.
 * The relation source and target can be an [[IEquivalenceClass]], [[IArgument]] or [[IInference]].
 *
 * Syntactically Ardown does not clearly distinguish between statement-statement relations
 * and statement-argument relations. This is intentionally: the + and - symbols can either represent
 * attack and support relations or contrariness and entailment, depending on the type of the relation's source
 * and target.
 *
 * The model plugin will determine the correct relation types, depending on the type of the relation's source and target.
 * If the source is a reconstructed argument,
 * the relation will be transformed to a logical relation of the argument's main conclusion.
 */
export interface IRelation extends HasColor {
  type: ArgdownTypes.RELATION;
  from?: RelationMember;
  to?: RelationMember;
  relationType: RelationType;
  /**
   * The locations in the Argdown source code at which this relation was defined.
   * The same relation can be defined in different ways.
   * It can also be defined in the same way, but in multiple places.
   */
  occurrences: IRuleNode[];
}
export namespace IRelation {
  export const relationToString = (r: IRelation) => {
    return `Relation(from: ${r.from!.title}, to: ${r.to!.title}, type: ${
      r.type
    })`;
  };
  export const isSymmetric = (r: IRelation) => {
    return (
      r.relationType === RelationType.CONTRARY ||
      r.relationType === RelationType.CONTRADICTORY
    );
  };
}
/**
 * A section in an Argdown document.
 * Sections can contain other sections as children. They are derived from headings
 * and used to derive groups (clusters) in argument maps.
 */
export interface ISection
  extends HasTitle,
    HasTags,
    HasText,
    HasLocation,
    HasData,
    HasColor,
    HasFontColor {
  type: ArgdownTypes.SECTION;
  /**
   * An automatically generated id unique among sections
   */
  id: string;
  level: number;
  children: ISection[];
  parent?: ISection;
  heading?: IRuleNode;
  /**
   * Should this section be used as a group in the argument map?
   *
   * If isGroup is undefined, the section will be used as a group if `level > maxLevel - groupDepth`.
   */
  isGroup?: boolean;
}
/**
 * The ArgdownTypes members identifying nodes in an argument map.
 */
export type MapNodeType =
  | ArgdownTypes.STATEMENT_MAP_NODE
  | ArgdownTypes.ARGUMENT_MAP_NODE
  | ArgdownTypes.GROUP_MAP_NODE;

/**
 * A node in an argument map.
 *
 * Can be either a statement, argument or group node.
 */
export interface IMapNode extends HasTitle, HasTags, HasColor, HasFontColor {
  type: MapNodeType;
  labelTitle?: string;
  labelText?: string;
  id: string;
}
/**
 * A group node within an argument map.
 *
 * Groups are clusters of child nodes and can be children of other groups.
 */
export interface IGroupMapNode extends IMapNode {
  type: ArgdownTypes.GROUP_MAP_NODE;
  level?: number;
  children?: IMapNode[];
  parent?: string;
  section?: ISection;
}
/**
 * An edge in an argument map derived from an [[IRelation]] or an [[IEquivalenceClass]].
 *
 */
export interface IMapEdge extends HasColor {
  type: ArgdownTypes.MAP_EDGE;
  id: string;
  /**
   * Source node of this edge
   */
  from: IMapNode;
  /**
   * Target node of this edge
   */
  to: IMapNode;
  /**
   * Stores the equivalence class if the edge is based on a relation that has one as a source or if this edge is derived from an equivalence class itself.
   */
  fromEquivalenceClass?: IEquivalenceClass;
  /**
   * Stores the equivalence class if the edge is based on a relation that has one as a target or if this edge is derived from an equivalence class itself.
   */
  toEquivalenceClass?: IEquivalenceClass;
  relationType: RelationType;
}
export namespace IMapEdge {
  export const toString = (e: IMapEdge) => {
    return `Edge(type: ${e.type} from: ${e.from.title} to: ${e.to.title})`;
  };
}
/**
 * An argument map, consisting of argument, statement and group nodes and support and attack edges between arguments and statements.
 */
export interface IMap {
  nodes: IMapNode[];
  edges: IMapEdge[];
}

export const isGroupMapNode = (n: IMapNode): n is IGroupMapNode => {
  return n.type === ArgdownTypes.GROUP_MAP_NODE;
};
export const isRuleNode = (n: IAstNode): n is IRuleNode => {
  return (<IRuleNode>n).type === ArgdownTypes.RULE_NODE;
};
export const isTokenNode = (n: IAstNode): n is ITokenNode => {
  return !(<any>n).type && (<ITokenNode>n).tokenType != null;
};
export const isReconstructed = (a: IArgument): boolean => {
  return a.pcs !== undefined && a.pcs.length > 0;
};
export const isConclusion = (s: IStatement): s is IConclusion => {
  return (
    (s.role === StatementRole.INTERMEDIARY_CONCLUSION ||
      s.role === StatementRole.MAIN_CONCLUSION) &&
    (<IConclusion>s).inference != undefined
  );
};
export const isArgumentStatement = (s: IStatement): s is IPCSStatement => {
  return (
    s.role === StatementRole.PREMISE ||
    s.role === StatementRole.INTERMEDIARY_CONCLUSION ||
    s.role == StatementRole.MAIN_CONCLUSION
  );
};
