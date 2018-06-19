import { IAstNode, IArgument, IEquivalenceClass, IRelation, ISection } from "./model/model";
import { IToken, IRecognitionException, ILexingError } from "chevrotain";
export interface ITagData {
  tag?: string;
  cssClass?: string;
  color?: string;
  index?: number;
}

/**
 * The basic properties of an ArgdownApplication response,
 * produced by running the [[ParserPlugin]], [[ModelPlugin]] and [[TagPlugin]].
 *
 * Additional data not included here is produced by other plugins.
 * Plugins should define response interfaces that extend IArgdownResponse.
 * They can then simply cast the provided IArgdownResponse object
 * to their own interface and add the additional data.
 */
export interface IArgdownResponse {
  /**
   * The abstract syntax tree of the Argdown input.
   * The tree consists of [[IRuleNode]] objects for every syntax rule applied.
   * Each [[IRuleNode]] contains other [[IRuleNode]] objects or [[IArgdownToken]] objects as children.
   *
   * Plugins can traverse the tree by defining [[IArgdownPlugin.tokenListeners]] and [[IArgdownPlugin.ruleListeners]].
   *
   * Provided by the ParserPlugin.
   */
  ast?: IAstNode;
  /**
   * A dictionary of all arguments defined in the Argdown input.
   * The keys are the argument titles. The values are [[Argument]] objects.
   *
   * Provided by the ModelPlugin
   */
  arguments?: { [title: string]: IArgument };
  /**
   * A dictionary of all statement equivalence classes defined in the Argdown input.
   * The keys are statement titles. The values are [[EquivalenceClass]] objects.
   *
   * The actual [[Statement]] objects are stored in the [[EquivalenceClass.members]] array.
   *
   * Provided by the ModelPlugin
   */
  statements?: { [title: string]: IEquivalenceClass };
  /**
   * A list of all relations defined in the Argdown input.
   *
   * Provided by the ModelPlugin
   */
  relations?: IRelation[];
  /**
   * A tree structure of all sections defined in the Argdown input.
   *
   * Provided by the ModelPlugin
   */
  sections?: ISection[];
  /**
   * A list of all tags used in the Argdown input.
   *
   * Provided by the ModelPlugin
   */
  tags?: string[];
  /**
   * A dictionary of [[ITagData]] objects for each tag used.
   *
   * Provided by the TagPlugin.
   */
  tagsDictionary?: { [tagName: string]: ITagData };
  /**
   * The list of tokens produced by the Argdown lexer that was used to produce the abstract syntax tree.
   *
   * Provided by the ParserPlugin.
   */
  tokens?: IToken[];
  /**
   * Errors thrown by the lexer.
   *
   * Provided by the ParserPlugin.
   */
  lexerErrors?: ILexingError[];
  /**
   * Errors thrown by the parser.
   *
   * Provided by the ParserPlugin.
   */
  parserErrors?: IRecognitionException[];
  /**
   * Errors thrown by plugins.
   *
   * Provided by any plugin throwing an exception.
   */
  exceptions?: Error[];
}
