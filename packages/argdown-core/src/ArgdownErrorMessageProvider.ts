import * as chevrotain from "chevrotain";
import { TokenType, IToken, IParserErrorMessageProvider } from "chevrotain";
import * as ArgdownLexer from "./lexer";

//import * as _ from 'lodash';

const defaultParserErrorProvider = chevrotain.defaultParserErrorProvider;
const tokenMatcher = chevrotain.tokenMatcher;
//const EOF = chevrotain.EOF;
export const MISSING_TEXT_CONTENT_ERROR = `Missing text content. Please add a line of text or refer to an existing statement or argument instead by replacing the content in this line with [Statement Title] or <Argument Title> (without a colon). If you want to define a statement ([Statement Title]:) or argument (<Argument Title>:), the defining text content has to follow the defined element title without any empty lines in between.`;
export const INVALID_INFERENCE_ERROR = `Invalid inference. Inferences can either be marked by four hyphens (----) or have the following format: 
--Inference Rule 1, Inference Rule 2 (my meta data property 1: 1, 2, 3; my meta data property 2: value) --`;
export const INVALID_RELATION_ERROR = `Invalid relation syntax. This may either be caused by a) an invalid relation parent or b) invalid indentation. a) Invalid relation parent: Only statements and arguments can have relations as child elements. b) Invalid Indentation tree: Please check that if there are preceding relations in this paragraph, there is at least one with equal or less indentation.`;
export const INVALID_INDENTATION_ERROR = `Invalid indentation.`;
export const MISSING_RELATION_CONTENT_ERROR = `Missing relation content. Please define or refer to a statement or argument (you can define a statement by simply adding a line of text).`;
export const MISSING_INFERENCE_END_ERROR = `Invalid inference syntax. Please end your inference with two hyphens (--)`;
export const INVALID_INFERENCE_POSITION_ERROR = `Invalid inference position. An inference may only occur within a premise-conclusion-structure, in which it is preceded by a premise and followed by a conclusion (both of which have to be numbered statements: '(1) Statement').`;
export const MISSING_INFERENCE_ERROR = `Missing inference. Use four hyphens (----) between two numbered statements to insert an inference in your premise-conclusion-structure and mark the latter statement as a conclusion.`;
export const MISSING_CONCLUSION_ERROR = `Missing conclusion. Please add a numbered statement after the inference.`;
export const INVALID_PCS_POSITION_ERROR = `Invalid position of premise conclusion structure (pcs). Make sure the pcs is preceded by an empty line.`;
export const INVALID_PCS_STATEMENT_CONTENT_ERROR = `Invalid statement content. An argument reference (<Argument Title>) or definition (<Argument Title>:) can not be used as premise or conclusion within a premise-conclusion-structure. Use statement references ([Statement Title]) or definitions ([Statement Title]:) instead.`;
export const INCOMPLETE_PCS_ERROR = `Incomplete premise-conclusion-structure (pcs). A pcs has to consist of at least one premise (a numbered statement: '(1) Statement Text'), one inference (marked by four hyphens ----) and one conclusion (a numbered statement after an inference). There may no be any empty lines between these elements.`;
export const INVALID_TEXT_POSITION_ERROR = `Invalid position of text content. Make sure it is not preceded by a statement reference ([Statement Title]) or argument reference (<Argument Title>).`;
const buildInvalidElementPositionError = (token: IToken): string => {
  const tokenDescription = getTokenDescription(token, true);
  return `Invalid element position. ${tokenDescription} may only occur at the beginning of a line or after a relation symbol.`;
};
const buildInvalidParagraphStartError = (token: IToken): string => {
  const tokenDescription = getTokenDescription(token);
  return `Invalid paragraph start. Argdown paragraphs may not start with ${tokenDescription}. If you do not want to start a new paragraph, remove any empty lines above this one. If you do want to start a new paragraph, try starting with normal text, a statement title, argument title or a list item (using * for unordered or 1. for ordered lists).`;
};
const buildInvalidRelationTextContentError = (token: IToken): string => {
  if (tokenMatcher(token, ArgdownLexer.ArgumentReference)) {
    return "Invalid relation text content. An argument reference (<Argument Title>) may not be preceded or followed by other content. If you want to start a new paragraph, insert an empty line before the reference. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
  } else if (tokenMatcher(token, ArgdownLexer.ArgumentDefinition)) {
    return "Invalid relation text content. An argument definition (<Argument Title>:) may not be preceded by other content. If you want to start a new paragraph, insert an empty line before the definition. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
  } else if (tokenMatcher(token, ArgdownLexer.StatementReference)) {
    return "Invalid relation text content. A statement reference ([Statement Title]) may not be preceded or followed by other content.  If you want to start a new paragraph, insert an empty line before the reference. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
  } else if (tokenMatcher(token, ArgdownLexer.StatementDefinition)) {
    return "Invalid relation text content. A statement definition ([Statement Title]:) may not be preceded by other content.  If you want to start a new paragraph, insert an empty line before the definition. If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
  } else {
    return "Invalid relation text content. Check that the content is not preceded by a statement reference ([Statement Title]) or argument reference (<Argument Title>). If you want to mention a statement or argument, without directly using it, use @[Statement Title] or @<Argument Title>.";
  }
};
const capitalizeFirstLetter = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const getTokenDescription = (token: IToken, capitalize: boolean = false): string => {
  let description = "MISSING DESCRIPTION";
  if (tokenMatcher(token, ArgdownLexer.OutgoingSupport)) {
    description = "an outgoing support relation (+ or <+)";
  } else if (tokenMatcher(token, ArgdownLexer.IncomingSupport)) {
    description = "an incoming support relation (+>)";
  } else if (tokenMatcher(token, ArgdownLexer.OutgoingAttack)) {
    description = "an outgoing attack relation (- or <-)";
  } else if (tokenMatcher(token, ArgdownLexer.IncomingAttack)) {
    description = "an incoming attack relation (->)";
  } else if (tokenMatcher(token, ArgdownLexer.Contradiction)) {
    description = "a contradictory relation (><)";
  } else if (tokenMatcher(token, ArgdownLexer.IncomingUndercut)) {
    description = "an incoming undercut relation (_>)";
  } else if (tokenMatcher(token, ArgdownLexer.OutgoingUndercut)) {
    description = "an incoming undercut relation (<_)";
  } else if (tokenMatcher(token, ArgdownLexer.ArgumentDefinition)) {
    description = "an argument definition (<Argument Title>:)";
  } else if (tokenMatcher(token, ArgdownLexer.ArgumentReference)) {
    description = "an argument reference (<Argument Title>)";
  } else if (tokenMatcher(token, ArgdownLexer.StatementDefinition)) {
    description = "a statement definition ([Statement Title]:)";
  } else if (tokenMatcher(token, ArgdownLexer.StatementReference)) {
    description = "a statement reference ([Statement Title])";
  }
  if (capitalize) {
    description = capitalizeFirstLetter(description);
  }
  return description;
};
const isRelationToken = (token: IToken): boolean => {
  return (
    tokenMatcher(token, ArgdownLexer.IncomingSupport) ||
    tokenMatcher(token, ArgdownLexer.OutgoingSupport) ||
    tokenMatcher(token, ArgdownLexer.IncomingAttack) ||
    tokenMatcher(token, ArgdownLexer.OutgoingAttack) ||
    tokenMatcher(token, ArgdownLexer.IncomingUndercut) ||
    tokenMatcher(token, ArgdownLexer.OutgoingUndercut) ||
    tokenMatcher(token, ArgdownLexer.Contradiction)
  );
};
const isRelationRule = (ruleName: string): boolean => {
  return (
    ruleName.endsWith("Support") ||
    ruleName.endsWith("Attack") ||
    ruleName.endsWith("Undercut") ||
    ruleName == "Contradiction"
  );
};
export interface IArgdownErrorMessageProvider extends IParserErrorMessageProvider {
  isRelationToken(token: IToken): boolean;
  isRelationRule(ruleName: string): boolean;
  getTokenDescription(token: IToken): string;
  buildInvalidElementPositionError(token: IToken): string;
  buildInvalidParagraphStartError(token: IToken): string;
  buildInvalidRelationTextContentError(token: IToken): string;
}
export const errorMessageProvider = <IArgdownErrorMessageProvider>{
  isRelationToken,
  isRelationRule,
  getTokenDescription,
  buildInvalidElementPositionError,
  buildInvalidParagraphStartError,
  buildInvalidRelationTextContentError,
  buildMismatchTokenMessage: (options: {
    expected: TokenType;
    actual: IToken;
    previous: IToken;
    ruleName: string;
  }): string => {
    if (options.ruleName == "inference") {
      if (options.expected == ArgdownLexer.InferenceStart) {
        return MISSING_INFERENCE_ERROR;
      } else if (options.expected == ArgdownLexer.InferenceEnd) {
        return MISSING_INFERENCE_END_ERROR;
      }
    } else if (
      options.expected == ArgdownLexer.Dedent &&
      (options.ruleName == "statementRelations" || options.ruleName == "argumentRelations")
    ) {
      return buildInvalidRelationTextContentError(options.actual);
    } else if (options.ruleName == "argumentStatement") {
      if (options.expected == ArgdownLexer.StatementNumber) {
        return MISSING_CONCLUSION_ERROR;
      }
    }
    return defaultParserErrorProvider.buildMismatchTokenMessage!(options);
  },
  buildNotAllInputParsedMessage: (options: { firstRedundant: IToken; ruleName: string }): string => {
    if (tokenMatcher(options.firstRedundant, ArgdownLexer.Indent) || isRelationToken(options.firstRedundant)) {
      return INVALID_RELATION_ERROR;
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.InferenceStart)) {
      return INVALID_INFERENCE_POSITION_ERROR;
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.StatementNumber)) {
      return INVALID_PCS_POSITION_ERROR;
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.ArgumentReference)) {
      return buildInvalidElementPositionError(options.firstRedundant);
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.ArgumentDefinition)) {
      return buildInvalidElementPositionError(options.firstRedundant);
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.StatementReference)) {
      return buildInvalidElementPositionError(options.firstRedundant);
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.StatementDefinition)) {
      return buildInvalidElementPositionError(options.firstRedundant);
    } else if (tokenMatcher(options.firstRedundant, ArgdownLexer.Freestyle)) {
      return INVALID_TEXT_POSITION_ERROR;
    } else {
      return defaultParserErrorProvider.buildNotAllInputParsedMessage!(options);
    }
  },
  buildNoViableAltMessage: (options: {
    expectedPathsPerAlt: TokenType[][][];
    actual: IToken[];
    previous: IToken;
    customUserDescription: string;
    ruleName: string;
  }): string => {
    const tokens = options.actual;
    if (options.ruleName == "argdown" && tokens.length > 0) {
      if (tokens.length >= 2 && tokenMatcher(tokens[0], ArgdownLexer.Indent)) {
        let secondToken = tokens[1];
        return buildInvalidParagraphStartError(secondToken);
      } else if (tokens.length > 0) {
        return buildInvalidParagraphStartError(tokens[0]);
      }
    } else if (isRelationRule(options.ruleName)) {
      return MISSING_RELATION_CONTENT_ERROR;
    } else if (options.ruleName == "statement") {
      if (
        tokens.length > 0 &&
        (tokenMatcher(tokens[0], ArgdownLexer.ArgumentReference) ||
          tokenMatcher(tokens[0], ArgdownLexer.ArgumentDefinition))
      ) {
        return INVALID_PCS_STATEMENT_CONTENT_ERROR;
      }
      return MISSING_TEXT_CONTENT_ERROR;
    }
    return defaultParserErrorProvider.buildNoViableAltMessage!(options);
  },
  buildEarlyExitMessage: (options: {
    expectedIterationPaths: TokenType[][];
    actual: IToken[];
    previous: IToken;
    customUserDescription: string;
    ruleName: string;
  }): string => {
    var firstToken = options.actual.length > 0 ? options.actual[0] : null;
    if (options.ruleName == "argdown") {
      if (firstToken && isRelationToken(firstToken)) {
        return INVALID_RELATION_ERROR;
      } else if (firstToken && tokenMatcher(firstToken, ArgdownLexer.InferenceStart)) {
        return INVALID_INFERENCE_POSITION_ERROR;
      }
    } else if (options.ruleName == "statementContent") {
      return MISSING_TEXT_CONTENT_ERROR;
    } else if (options.ruleName == "pcs") {
      if (firstToken && isRelationToken(firstToken)) {
        return INVALID_INDENTATION_ERROR;
      }
      return INCOMPLETE_PCS_ERROR;
    } else if (options.ruleName == "data") {
      return INVALID_INFERENCE_ERROR;
    } else if (firstToken && tokenMatcher(firstToken, ArgdownLexer.InferenceEnd)) {
      return INVALID_INFERENCE_ERROR;
    }
    return defaultParserErrorProvider.buildEarlyExitMessage!(options);
  }
};
