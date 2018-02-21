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
  run(data, logger){
    if(!data.input){
      return data;
    }
    
    let lexResult = this.lexer.tokenize(data.input);
    data.tokens = lexResult.tokens; 
    data.lexerErrors = lexResult.errors;

    this.parser.input = lexResult.tokens;
    data.ast = this.parser.argdown();
    data.parserErrors = this.parser.errors;

    if(data.lexerErrors && data.lexerErrors.length > 0){
      logger.log("verbose", data.lexerErrors);
    }
    if(data.parserErrors && data.parserErrors.length > 0){
      // //add location if token is EOF
      var lastToken = _.last(data.tokens);
      for(let error of data.parserErrors){
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
      // logger.log("verbose", data.parserErrors);
    }
    return data;    
  }
}
module.exports = {
  ParserPlugin: ParserPlugin
}
