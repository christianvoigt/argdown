import * as argdownLexer from "../lexer";
import { parser } from "../parser";
import { IArgdownPlugin } from "../IArgdownPlugin";
import { IArgdownLogger } from "../IArgdownLogger";
import { ArgdownPluginError } from "../ArgdownPluginError";
import { IArgdownRequest, IArgdownResponse } from "../index";
import { IAstNode } from "../model/model";
import {
  IToken,
  ILexingError,
  IRecognitionException,
  tokenMatcher,
  EOF,
  createTokenInstance
} from "chevrotain";
import last from "lodash.last";

declare module "../index" {
  interface IArgdownResponse {
    /**
     * The abstract syntax tree of the Argdown input.
     * The tree consists of [[IRuleNode]] objects for every syntax rule applied.
     * Each [[IRuleNode]] contains other [[IRuleNode]] objects or [[IArgdownToken]] objects as children.
     *
     * Plugins can traverse the tree by defining [[IArgdownPlugin.tokenListeners]] and [[IArgdownPlugin.ruleListeners]].
     *
     * Provided by the [[ParserPlugin]].
     */
    ast?: IAstNode;
    /**
     * The list of tokens produced by the Argdown lexer that was used to produce the abstract syntax tree.
     *
     * Provided by the [[ParserPlugin]].
     */
    tokens?: IToken[];
    /**
     * Errors thrown by the lexer.
     *
     * Provided by the [[ParserPlugin]].
     */
    lexerErrors?: ILexingError[];
    /**
     * Errors thrown by the parser.
     *
     * Provided by the [[ParserPlugin]].
     */
    parserErrors?: IRecognitionException[];
  }
}

/**
 * The ParserPlugin is the most basic building block of an ArgdownApplication.
 * It takes a string provided in [[IArgdownRequest.input]]
 * and scans it for tokens. The resulting tokens list is added to the [[IArgdownResponse.tokens]] response property.
 * The tokens are parsed into an abstract syntax tree (AST).
 * The AST is added to the [[IArgdownResponse.ast]] response property.
 *
 * The AST is then used by the [[ModelPlugin]] to build the basic data model used by most other plugins.
 *
 * Lexer errors are added to [[IArgdownResponse.lexerErrors]] response property. Parser errors are added to the [[IArgdownResponse.parserErrors]] response property.
 * These errors can be used to build an Argdown linter.
 */
export class ParserPlugin implements IArgdownPlugin {
  name: string = "ParserPlugin";
  run(
    request: IArgdownRequest,
    response: IArgdownResponse,
    logger: IArgdownLogger
  ) {
    if (!request.input) {
      throw new ArgdownPluginError(this.name, "No input field in request.");
    }

    let lexResult = argdownLexer.tokenize(request.input);
    response.tokens = lexResult.tokens;
    response.lexerErrors = lexResult.errors;
    parser.input = lexResult.tokens;
    response.ast = parser.argdown();
    response.parserErrors = parser.errors;

    if (response.lexerErrors && response.lexerErrors.length > 0) {
      logger.log(
        "verbose",
        "[ParserPlugin]: Lexer returned errors.\n" +
          JSON.stringify(response.lexerErrors)
      );
    }
    if (response.parserErrors && response.parserErrors.length > 0) {
      logger.log(
        "verbose",
        "[ParserPlugin]: Parser returned errors.\n" +
          JSON.stringify(response.parserErrors)
      );
    }
    if (response.parserErrors && response.parserErrors.length > 0) {
      // //add location if token is EOF
      var lastToken = last(response.tokens);
      for (let error of response.parserErrors) {
        if (error.token && tokenMatcher(error.token, EOF)) {
          const startLine = lastToken!.endLine || 1;
          const endLine = startLine;
          const startOffset = lastToken!.endOffset || 1;
          const endOffset = startOffset;
          const startColumn = lastToken!.endColumn || 1;
          const endColumn = startColumn;
          const newToken = createTokenInstance(
            EOF,
            "",
            startOffset,
            endOffset,
            startLine,
            endLine,
            startColumn,
            endColumn
          );
          error.token = newToken;
        }
      }
    }
    return response;
  }
}
