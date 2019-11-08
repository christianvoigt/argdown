import * as argdownLexer from "../lexer";
import { parser } from "../parser";
import { IArgdownPlugin, IRequestHandler } from "../IArgdownPlugin";
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
import { isObject, mergeDefaults } from "../utils";
import defaultsDeep from "lodash.defaultsdeep";

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
  interface IArgdownRequest {
    /**
     * Settings of the parser plugin. The parser plugin executes parser *and*  lexer.
     */
    parser?: IParserPluginSettings;
  }
}
interface IParserPluginSettings {
  /**
   * Throw exceptions if parser or lexer returns error. Otherwise will simply add the errors to the response. By default set to false.
   */
  throwExceptions?: boolean;
}
const defaultSettings: IParserPluginSettings = {
  throwExceptions: false
};

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
  defaults: IParserPluginSettings = {};
  constructor(config?: IParserPluginSettings) {
    this.defaults = defaultsDeep({}, config, defaultSettings);
  }
  getSettings = (request: IArgdownRequest) => {
    if (!isObject(request.parser)) {
      request.parser = {};
    }
    return request.parser;
  };
  prepare: IRequestHandler = request => {
    mergeDefaults(this.getSettings(request), this.defaults);
  };

  run(
    request: IArgdownRequest,
    response: IArgdownResponse,
    logger: IArgdownLogger
  ) {
    if (!request.input) {
      throw new ArgdownPluginError(
        this.name,
        "missing-input-request-field",
        "No input field in request."
      );
    }
    const settings = this.getSettings(request);
    let lexResult = argdownLexer.tokenize(request.input);
    response.tokens = lexResult.tokens;
    response.lexerErrors = lexResult.errors;
    parser.input = lexResult.tokens;
    response.ast = parser.argdown();
    response.parserErrors = parser.errors;

    if (response.lexerErrors && response.lexerErrors.length > 0) {
      if (settings.throwExceptions) {
        // do throw error instead of returning a response
        throw new ArgdownPluginError(
          this.name,
          "lexer-error",
          JSON.stringify(response.lexerErrors)
        );
      } else {
        logger.log(
          "verbose",
          "[ParserPlugin]: Lexer returned errors.\n" +
            JSON.stringify(response.lexerErrors)
        );
      }
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
      if (settings.throwExceptions) {
        // do throw error instead of returning a response
        throw new ArgdownPluginError(
          this.name,
          "parser-error",
          JSON.stringify(response.parserErrors)
        );
      } else {
        logger.log(
          "verbose",
          "[ParserPlugin]: Parser returned errors.\n" +
            JSON.stringify(response.parserErrors)
        );
      }
    }
    return response;
  }
}
