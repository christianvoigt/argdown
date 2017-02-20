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

module.exports = {
  printAst : printAst,
  parse: function(inputText){
    let lexResult = lexer.tokenize(inputText);
    //parser.input = lexResult.tokens;
    let parser = new ArgdownParser(lexResult.tokens);
    let value = parser.statements()

    if (parser.errors.length > 0) {
      console.log(parser.errors);
       throw new Error("sad sad panda, Parsing errors detected")
    }

    //printAst(value);

    return{
      value:       value, // this is a pure grammar, the value will always be <undefined>
      lexErrors:   lexResult.errors,
      parseErrors: parser.errors
    };
  }
}
