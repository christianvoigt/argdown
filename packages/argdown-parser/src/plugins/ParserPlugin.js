import * as _ from 'lodash';
import {ArgdownLexer} from '../ArgdownLexer.js';
import {ArgdownParser} from "../ArgdownParser.js";
import * as chevrotain from 'chevrotain';

const tokenMatcher = chevrotain.tokenMatcher;

class ParserPlugin{
  set config(config){
    let previousSettings = this.settings;
    if(!previousSettings){
      previousSettings = {
      }
    }
    this.settings = _.defaultsDeep({}, config, previousSettings);    
  }
  constructor(config){
    this.name = "ParserPlugin";
    this.config = config;
    this.lexer = ArgdownLexer;
    this.parser = ArgdownParser;    
  }
  run(request, response, logger){
    if(!request.input){
      return response;
    }
    
    let lexResult = this.lexer.tokenize(request.input);
    response.tokens = lexResult.tokens; 
    response.lexerErrors = lexResult.errors;

    this.parser.input = lexResult.tokens;
    response.ast = this.parser.argdown();
    response.parserErrors = this.parser.errors;

    if(response.lexerErrors && response.lexerErrors.length > 0){
      logger.log("verbose", response.lexerErrors);
    }
    if(response.parserErrors && response.parserErrors.length > 0){
      // //add location if token is EOF
      var lastToken = _.last(response.tokens);
      for(let error of response.parserErrors){
        if(error.token && tokenMatcher(error.token, chevrotain.EOF)){
          const startLine = lastToken.endLine;
          const endLine = startLine;
          const startOffset = lastToken.endOffset;
          const endOffset = startOffset;
          const startColumn = lastToken.endColumn;
          const endColumn = startColumn;
          const newToken = chevrotain.createTokenInstance(chevrotain.EOF, "", startOffset, endOffset, startLine, endLine, startColumn, endColumn);
          error.token = newToken;
        }
      }
    }
    return response;    
  }
}
module.exports = {
  ParserPlugin: ParserPlugin
}
