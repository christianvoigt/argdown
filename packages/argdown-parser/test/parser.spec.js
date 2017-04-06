//import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import {ArgdownLexer, ArgdownParser, ArgdownTreeWalker} from '../src/index.js';

const lexer = ArgdownLexer;
const parser = ArgdownParser;
const walker = new ArgdownTreeWalker();

describe("Parser", function() {
    it("can parse complex argdown file", function(){
    let source = fs.readFileSync("./test/veggie_debate.argdown", 'utf8');
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    //let parseResult = parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse argument definitions and references", function(){
    let source = fs.readFileSync("./test/parser-arguments.argdown", 'utf8');
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    //let parseResult = parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can return errors", function(){
    let source = "Text <Title>:\n\n+ text";
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    //let parseResult = parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.exit;
  });
});

describe("ArgdownTreeWalker", function() {
  it("can walk", function(){
    let source = "Hallo Welt!";
    let lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    let parseResult = parser.argdown();
    let statements = 0;
    walker.on('statementEntry',(node)=>{statements++; expect(node.name).to.equal('statement');});
    walker.walk(parseResult);
    expect(statements).to.equal(1);
  });
});
