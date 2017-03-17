"use strict";

import * as lexer from './ArgdownLexer.js';
import {ArgdownParser} from "./ArgdownParser.js";
import {Token} from "chevrotain";

//const parser = new ArgdownParser([]);
function printAst(value){
  let str = printAstRecursively(value, "", "");
  console.log(str);
}
function printAstRecursively(value, pre, str){
  if(value === undefined){
    str += "undefined";
    return str;
  }else if(value instanceof Token){
    str += value.constructor.name;
    return str;
  }
  str += value.name;
  if(value.children && value.children.length > 0){
    let nextPre = pre + " |";
    for(let child of value.children){
      str += "\n" + nextPre + "__";
      str = printAstRecursively(child, nextPre, str);
    }
    str += "\n" + pre;
  }
  return str;
}

const parser = new ArgdownParser([]);

module.exports = {
  printAst : printAst,
  printTokens : lexer.logTokens,
  lex: function(inputText){
    return lexer.tokenize(inputText);
  },
  parse: function(inputText){
    let lexResult = lexer.tokenize(inputText);
    //parser.input = lexResult.tokens;
    parser.input = lexResult.tokens;
    let value = parser.argdown()

    if (parser.errors.length > 0) {
      console.log(parser.errors);
       throw new Error("sad sad panda, Parsing errors detected")
    }

    //printAst(value);

    return{
      lexResult:lexResult,
      value:       value, // this is a pure grammar, the value will always be <undefined>
      lexErrors:   lexResult.errors,
      parseErrors: parser.errors
    };
  }
}
