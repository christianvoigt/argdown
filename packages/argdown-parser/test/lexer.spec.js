//import { before, after, describe, it } from 'mocha';
import { expect } from 'chai';
import fs from 'fs';
import argdownLexer from '../src/ArgdownLexer.js';


describe("Lexer", function() {
  it("recognizes incoming and outgoing relations", function(){
    let source = fs.readFileSync("./test/lexer-relations.argdown", 'utf8');
    const result = argdownLexer.tokenize(source);
    const tokens = result.tokens;
    expect(tokens[0]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
    expect(tokens[1]).to.be.an.instanceof(argdownLexer.OutgoingAttack);
    expect(tokens[2]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
    expect(tokens[3]).to.be.an.instanceof(argdownLexer.OutgoingAttack);
    expect(tokens[4]).to.be.an.instanceof(argdownLexer.IncomingSupport);
    expect(tokens[5]).to.be.an.instanceof(argdownLexer.IncomingAttack);
  });
  it("can distinguish between Emptyline and Newline", function(){
    let source = fs.readFileSync("./test/lexer-emptyline.argdown", 'utf8');
    const result = argdownLexer.tokenize(source);
    const tokens = result.tokens;
    expect(tokens[0]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[1]).to.be.an.instanceof(argdownLexer.Emptyline);
    expect(tokens[2]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[3]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[4]).to.be.an.instanceof(argdownLexer.Emptyline);
    expect(tokens[5]).to.be.an.instanceof(argdownLexer.Freestyle);
  });
  it("can dedent on Emptyline",function(){
    let source = fs.readFileSync("./test/lexer-emptyline-dedent.argdown", 'utf8');
    const result = argdownLexer.tokenize(source);
    const tokens = result.tokens;
    expect(tokens[0]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[1]).to.be.an.instanceof(argdownLexer.Indent);
    expect(tokens[2]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
    expect(tokens[3]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[4]).to.be.an.instanceof(argdownLexer.Dedent);
    expect(tokens[5]).to.be.an.instanceof(argdownLexer.Emptyline);
    expect(tokens[6]).to.be.an.instanceof(argdownLexer.Freestyle);
  });
  it("can ignore Newlines in relations",function(){
    let source = fs.readFileSync("./test/lexer-linebreak.argdown", 'utf8');
    const result = argdownLexer.tokenize(source);
    const tokens = result.tokens;
    expect(tokens[0]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[1]).to.be.an.instanceof(argdownLexer.Indent);
    expect(tokens[2]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
    expect(tokens[3]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[4]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[5]).to.be.an.instanceof(argdownLexer.OutgoingAttack);
    expect(tokens[6]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[7]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[8]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
    expect(tokens[9]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[10]).to.be.an.instanceof(argdownLexer.Freestyle);
    expect(tokens[11]).to.be.an.instanceof(argdownLexer.Dedent);
  });
   it("can lex complex indentation", function() {
     let source = fs.readFileSync("./test/lexer-indentation.argdown", 'utf8');
     const result = argdownLexer.tokenize(source);
     const tokens = result.tokens;
     expect(tokens[0]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[1]).to.be.an.instanceof(argdownLexer.Indent);
     expect(tokens[2]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
     expect(tokens[3]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[4]).to.be.an.instanceof(argdownLexer.OutgoingAttack);
     expect(tokens[5]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[6]).to.be.an.instanceof(argdownLexer.Indent);
     expect(tokens[7]).to.be.an.instanceof(argdownLexer.OutgoingSupport);
     expect(tokens[8]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[9]).to.be.an.instanceof(argdownLexer.Indent);
     expect(tokens[10]).to.be.an.instanceof(argdownLexer.OutgoingAttack);
     expect(tokens[11]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[12]).to.be.an.instanceof(argdownLexer.Indent);
     expect(tokens[13]).to.be.an.instanceof(argdownLexer.IncomingSupport);
     expect(tokens[14]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[15]).to.be.an.instanceof(argdownLexer.Dedent);
     expect(tokens[16]).to.be.an.instanceof(argdownLexer.Dedent);
     expect(tokens[17]).to.be.an.instanceof(argdownLexer.Dedent);
     expect(tokens[18]).to.be.an.instanceof(argdownLexer.IncomingAttack);
     expect(tokens[19]).to.be.an.instanceof(argdownLexer.Freestyle);
     expect(tokens[20]).to.be.an.instanceof(argdownLexer.Dedent);

   });
   it("can recognize argument and statement references and definitions", function(){
     let source = fs.readFileSync("./test/lexer-definitions-references.argdown", 'utf8');
     const result = argdownLexer.tokenize(source);
     const tokens = result.tokens;
     expect(tokens[0]).to.be.an.instanceof(argdownLexer.StatementReference);
     expect(tokens[1]).to.be.an.instanceof(argdownLexer.StatementDefinition);
     expect(tokens[2]).to.be.an.instanceof(argdownLexer.ArgumentReference);
     expect(tokens[3]).to.be.an.instanceof(argdownLexer.ArgumentDefinition);
     expect(tokens[4]).to.be.an.instanceof(argdownLexer.Freestyle);

   });
});
