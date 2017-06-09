import * as _ from 'lodash';
import {ArgdownLexer} from '../ArgdownLexer.js';
import {ArgdownParser} from "../ArgdownParser.js";

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
  run(data){
    if(!data.input){
      return data;
    }
    const verbose = data.config && data.config.verbose;
    
    let lexResult = this.lexer.tokenize(data.input);
    data.tokens = lexResult.tokens; 
    data.lexerErrors = lexResult.errors;

    this.parser.input = lexResult.tokens;
    data.ast = this.parser.argdown();
    data.parserErrors = this.parser.errors;

    if(verbose && data.lexerErrors && data.lexerErrors.length > 0){
      console.log(data.lexerErrors);
    }
    if(verbose && data.parserErrors && data.parserErrors.length > 0){
      console.log(data.parserErrors);
    }
    return data;    
  }
}
module.exports = {
  ParserPlugin: ParserPlugin
}
