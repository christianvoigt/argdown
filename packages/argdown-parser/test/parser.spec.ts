//import { before, after, describe, it } from 'mocha';
import { expect } from "chai";
import fs from "fs";
import { tokenize, parser, ArgdownTreeWalker } from "../src/index";
import { Logger } from "../src/index";

const walker = new ArgdownTreeWalker();

describe("Parser", function() {
  it("can parse argdown with leading and trailing emptylines", function() {
    let source = "\n\n\n\n\nHallo World!\n\n\n<!-- Comment -->\n\n";
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse complex argdown file", function() {
    let source = fs.readFileSync("./test/veggie_debate.argdown", "utf8");
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse argument definitions and references", function() {
    let source = fs.readFileSync("./test/parser-arguments.argdown", "utf8");
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can return errors", function() {
    let source = "Text <Title>:\n\n+ text";
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    //console.log(parser.errors[0]);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.exist;
  });
  it("can escape characters", function() {
    let source = "<Title>: text \\[text\\]";
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can add line numbers", function() {
    let source = `# Heading

Statement

[Statement Definition]: Bla
    + support relation
    - attack relation
    +> incoming support
    -> incoming attack

[Statement Reference] 
  >< Contradiction

<Argument Definition>: Bla

<Argument Reference>

(1) A
(2) B
----
(3) C

 1. A
 2. B

 * A
 * B
`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    let ast = parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
    //console.log(parser.astToJsonString(ast));
    expect(ast.children[0].startLine).to.equal(1); // Heading
    expect(ast.children[1].startLine).to.equal(3); // Statement
    expect(ast.children[2].startLine).to.equal(5); // Statement Definition
    expect(ast.children[2].children[1].children[1].startLine).to.equal(6); // Outgoing Support
    expect(ast.children[2].children[1].children[2].startLine).to.equal(7); // Outgoing Attack
    expect(ast.children[2].children[1].children[3].startLine).to.equal(8); // Incoming Support
    expect(ast.children[2].children[1].children[4].startLine).to.equal(9); // Incoming Attack
    expect(ast.children[3].startLine).to.equal(11); // Statement Reference
    expect(ast.children[3].children[1].children[2].startLine).to.equal(12); // Contradiction
    expect(ast.children[4].startLine).to.equal(14); // Argument Definition
    expect(ast.children[5].startLine).to.equal(16); // Argument Reference
    expect(ast.children[6].children[0].startLine).to.equal(18); // Argument Statement 1
    expect(ast.children[6].children[1].children[0].startLine).to.equal(19); // Argument Statement 2
    expect(ast.children[6].children[1].children[1].startLine).to.equal(20); // Inference
    expect(ast.children[6].children[1].children[2].startLine).to.equal(21); // Argument Statement 3
    expect(ast.children[7].children[1].startLine).to.equal(23); // Ordered List item 1
    expect(ast.children[7].children[2].startLine).to.equal(24); // Ordered List item 2
    expect(ast.children[8].children[1].startLine).to.equal(26); // Unordered List item 1
    expect(ast.children[8].children[2].startLine).to.equal(27); // Unordered List item 2
  });
  // it("can return custom NoViableAltMessage", function () {
  //   let source = `asdda
  // + adas [sdsd] sadd`;
  //   let lexResult = tokenize(source);
  //   parser.input = lexResult.tokens;
  //   let parseResult = parser.argdown();
  //   console.log(parser.errors[0]);
  // });
  it("can escape characters", function() {
    let source = "<Title>: text \\[text\\]";
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse inference relations", function() {
    let source = `
    (1) A
    (2) B
    ----
      <_ C
    (3) D
`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    let ast = parser.argdown();
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
    //console.log(parser.astToString(ast));
    const pcsTail = ast.children[0].children[1];
    expect(pcsTail.children[1]).to.exist; // inference
    expect(pcsTail.children[1].name).to.equal("inference");
    expect(pcsTail.children[1].children[2]).to.exist; // relations
    expect(pcsTail.children[1].children[2].name).to.equal("relations"); // relations
    expect(pcsTail.children[1].children[2].children[0].tokenType.tokenName).to.equal("Indent");
    expect(pcsTail.children[1].children[2].children[1].name).to.equal("outgoingUndercut");
  });
});

describe("ArgdownTreeWalker", function() {
  it("can walk", function() {
    let source = "Hallo Welt!";
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    let ast = parser.argdown();
    let statements = 0;
    walker.on("statementEntry", (request, response, node) => {
      statements++;
      expect(node.name).to.equal("statement");
    });
    walker.walk({}, { ast: ast }, new Logger());
    expect(statements).to.equal(1);
  });
});
