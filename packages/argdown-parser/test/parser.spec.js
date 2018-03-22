//import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import {ArgdownLexer, ArgdownParser, ArgdownTreeWalker} from '../src/index.js';

const lexer = ArgdownLexer;
const parser = ArgdownParser;
const walker = new ArgdownTreeWalker();

describe("Parser", function() {
  it("can parse argdown with leading and trailing emptylines", function(){
    let source = "\n\n\n\n\nHallo World!\n\n\n<!-- Comment -->\n\n";
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse complex argdown file", function(){
    let source = fs.readFileSync("./test/veggie_debate.argdown", 'utf8');
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse argument definitions and references", function(){
    let source = fs.readFileSync("./test/parser-arguments.argdown", 'utf8');
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can return errors", function(){
    let source = "Text <Title>:\n\n+ text";
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    //console.log(parser.errors[0]);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.exist;
  });
  it("can escape characters", function () {
    let source = "<Title>: text \\[text\\]";
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  // it("can return custom NoViableAltMessage", function () {
  //   let source = `asdda
  // + adas [sdsd] sadd`;
  //   let lexResult = lexer.tokenize(source);
  //   parser.input = lexResult.tokens;
  //   let parseResult = parser.argdown();
  //   console.log(parser.errors[0]);
  // });
});

describe("ArgdownTreeWalker", function() {
  it("can walk", function(){
    let source = "Hallo Welt!";
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    let ast = parser.argdown();
    let statements = 0;
    walker.on('statementEntry',(request, response, node)=>{statements++; expect(node.name).to.equal('statement');});
    walker.walk({}, {ast: ast});
    expect(statements).to.equal(1);
  });
});
