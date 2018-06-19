import { RuleNames } from "../RuleNames";

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
  sortedTags?: string[];
}
export interface HasMetaData {
  metaData?: any;
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
  section?: ISection;
}
/**
 * Represents a matched Argdown syntax rule in the abstract syntax tree produced by the [[ParserPlugin]].
 * Has either other [[IRuleNode]]s or [[ITokenNode]]s as children.
 */
export interface IRuleNode extends HasLocation, HasMetaData, HasText, HasTags, HasTitle {
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
/**
 * Represents a matched Argdown token in the abstract syntax tree produced by the [[ParserPlugin]].
 */
export interface ITokenNode extends chevrotain.IToken, HasTitle, HasMetaData, HasText {
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
export interface IArgument extends HasTitle, HasRelations, HasTags, HasMetaData, HasLocation, HasSection {
  type: ArgdownTypes.ARGUMENT;
  /**
   * If the argument was logically reconstructed, it has a premise conclusion structure (pcs).
   * A pcs consists of a statement list (not a list of equivalence classes)
   * in which each statement plays either the role of "premise" or "conclusion".
   * Using statements makes it possible to save argument-specific data in the statements:
   * This is used to save the role of the statement in this argument. It is either a PREMISE, PRELIMINARY_CONCLUSION or MAIN_CONCLUSION.
   * Statements that have the role of a conclusion in the argument possess an inference property.
   */
  pcs: IStatement[];
  /**
   * The statements that were used to describe the argument in argument definitions.
   * These statements are not members of any equivalence class,
   * have no logical relations and do not exist in the model apart from the argument.
   */
  descriptions: IStatement[];
}
/**
 * Each statement represents a paragraph of text in the original Argdown source code.
 * Statements are thus not "propositions" in the philosophical sense or "strings" in the computational sense.
 * Instead they represent string occurrences in a document.
 *
 * Each statement belongs to exactly one [[IEquivalenceClass]], identified by the statement's title. If no title was defined, a title is automatically generated.
 *
 * For further details on the relationship between equivalence classes and statements, see [[IEquivalenceClass]].
 */
export interface IStatement extends HasTitle, HasTags, HasMetaData, HasLocation, HasSection, HasText {
  type: ArgdownTypes.STATEMENT;
  role?: StatementRole;
  isReference?: boolean;
}
/**
 * The role of a statement occurrence in an Argdown document.
 *
 * If the statement is used in an argument's premise conclusion structure
 * it is either a PREMISE, PRELIMINARY_CONCLUSION or a CONCLUSION.
 *
 * If it is used to describe an argument in an argument definition, it is an ARGUMENT_DESCRIPTION.
 *
 * If it is used to define a relation it is a RELATION_STATEMENT and
 * if it is a standalone paragraph within the Argdown text it is a TOP_LEVEL_STATEMENT.
 */
export enum StatementRole {
  PREMISE = "premise",
  PRELIMINARY_CONCLUSION = "preliminary-conclusion",
  MAIN_CONCLUSION = "main-conclusion",
  ARGUMENT_DESCRIPTION = "argument-description",
  TOP_LEVEL_STATEMENT = "top-level-statement",
  RELATION_STATEMENT = "relation-statement"
}
/**
 * A statement used within an argument's premise-conclusion-structure ([[IArgument.pcs]])
 */
export interface IArgumentStatement extends IStatement {
  role: StatementRole.PREMISE | StatementRole.MAIN_CONCLUSION | StatementRole.PRELIMINARY_CONCLUSION;
  argumentTitle?: string;
}
/**
 * A statement used as conclusion within an argument's premise-conclusion-structure ([[IArgument.pcs]])
 */
export interface IConclusion extends IArgumentStatement {
  role: StatementRole.PRELIMINARY_CONCLUSION | StatementRole.MAIN_CONCLUSION;
  inference?: IInference;
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
export interface IEquivalenceClass extends HasTitle, HasRelations, HasTags, HasMetaData, HasLocation, HasSection {
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
  isUsedAsPreliminaryConclusion?: boolean;
  /**
   * is true if any member statement is used as top level element (as child of the argdown rule)
   */
  isUsedAsTopLevelStatement?: boolean;
  /**
   * is true if any member statement is used as content of a relation (will ignore references)
   */
  isUsedAsRelationStatement?: boolean;
}
/**
 * An inference in an argument's premise-conclusion-structure (pcs).
 * To keep the pcs simple, inferences are stored as property of the conclusion statement that is inferred.
 * Thus, the last statement of a pcs will always be a conclusion containing an inference.
 *
 * Inferences can be identified by their argument's title and their conclusion's index in the argument's pcs.
 */
export interface IInference extends HasTitle, HasRelations, HasMetaData, HasLocation, HasSection {
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
export interface IRelation {
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
/**
 * A section in an Argdown document.
 * Sections can contain other sections as children. They are derived from headings
 * and used to derive groups (clusters) in argument maps.
 */
export interface ISection extends HasTitle, HasTags, HasText, HasLocation, HasMetaData {
  type: ArgdownTypes.SECTION;
  /**
   * An automatically generated id unique among sections
   */
  id: string;
  level: number;
  children: ISection[];
  parent?: ISection;
  heading?: IRuleNode;
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
export interface IMapNode extends HasTitle, HasTags {
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
export interface IMapEdge {
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
/**
 * An argument map, consisting of argument, statement and group nodes and support and attack edges between arguments and statements.
 */
export interface IMap {
  nodes: IMapNode[];
  edges: IMapEdge[];
}
