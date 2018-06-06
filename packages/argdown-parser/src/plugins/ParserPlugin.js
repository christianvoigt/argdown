import * as _ from "lodash";
import { ArgdownLexer } from "../ArgdownLexer.js";
import { ArgdownParser } from "../ArgdownParser.js";
import * as chevrotain from "chevrotain";

const tokenMatcher = chevrotain.tokenMatcher;

class ParserPlugin {
  constructor(config) {
    this.defaults = _.defaultsDeep({}, config);
    this.name = "ParserPlugin";
    this.lexer = ArgdownLexer;
    this.parser = ArgdownParser;
  }
  run(request, response, logger) {
    if (!request.input) {
      logger.log("error", "[ParserPlugin]: No input field in request.");
      return response;
    }

    let lexResult = this.lexer.tokenize(request.input);
    response.tokens = lexResult.tokens;
    response.lexerErrors = lexResult.errors;

    this.parser.input = lexResult.tokens;
    response.ast = this.parser.argdown();
    response.parserErrors = this.parser.errors;

    if (response.lexerErrors && response.lexerErrors.length > 0) {
      logger.log(
        "verbose",
        "[ParserPlugin]: Lexer returned errors.\n" +
          JSON.stringify(response.lexerErrors)
      );
    }
    if (response.parserErrors && response.parserErrors.length > 0) {
      // //add location if token is EOF
      var lastToken = _.last(response.tokens);
      for (let error of response.parserErrors) {
        if (error.token && tokenMatcher(error.token, chevrotain.EOF)) {
          const startLine = lastToken.endLine;
          const endLine = startLine;
          const startOffset = lastToken.endOffset;
          const endOffset = startOffset;
          const startColumn = lastToken.endColumn;
          const endColumn = startColumn;
          const newToken = chevrotain.createTokenInstance(
            chevrotain.EOF,
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
module.exports = {
  ParserPlugin: ParserPlugin
};
