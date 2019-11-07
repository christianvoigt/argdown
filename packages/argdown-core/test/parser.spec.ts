//import { before, after, describe, it } from 'mocha';
import { expect } from "chai";
import * as fs from "fs";
import { tokenize, parser, ArgdownTreeWalker } from "../src/index";
import { Logger } from "../src/index";
import {
  INVALID_PCS_POSITION_ERROR,
  MISSING_INFERENCE_END_ERROR,
  errorMessageProvider
} from "../src/ArgdownErrorMessageProvider";

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
  it("sanity check 1: can parse veggie debate", function() {
    let source = fs.readFileSync("./test/veggie_debate.argdown", "utf8");
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    // const ast = parser.argdown();
    parser.argdown();
    // console.log(parser.errors[0]);
    // console.log(astToString(ast));
    // console.log(astToJsonString(ast));
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("sanity check 2: can parse semmelweis debate", function() {
    let source = fs.readFileSync("./test/semmelweis_betz.argdown", "utf8");
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    // const ast = parser.argdown();
    parser.argdown();
    // console.log(parser.errors[0]);
    // console.log(astToString(ast));
    // console.log(astToJsonString(ast));
    expect(lexResult.errors).to.be.empty;
    // console.log(parser.errors);
    expect(parser.errors).to.be.empty;
  });
  it("sanity check 3: can parse the Argdown intro", function() {
    let source = fs.readFileSync("./test/intro.argdown", "utf8");
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    // const ast = parser.argdown();
    parser.argdown();
    // console.log(parser.errors[0]);
    // console.log(astToString(ast));
    // console.log(astToJsonString(ast));
    expect(lexResult.errors).to.be.empty;
    console.log(parser.errors);
    expect(parser.errors).to.be.empty;
  });
  it("can parse relation with subsequent comment", function() {
    let source = `
<A>
    +> [B]
    <!--Comment-->
  
THE END
    `;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    // console.log(tokensToString(lexResult.tokens));
    // console.log(astToString(ast));
    // console.log(parser.errors);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse argument with premise relations", function() {
    let source = `A
      + B`;
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
  it("can return Argdown error on title preceded by text", function() {
    let source = `Text <Title>:`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.exist;
    expect(parser.errors.length).to.equal(1);
    const error = parser.errors[0];
    expect(error.name).to.equal("NotAllInputParsedException");
    expect(error.message).to.equal(
      errorMessageProvider.buildInvalidElementPositionError(error.token)
    );
    expect(error.token.startLine).to.equal(1);
    expect(error.token.startColumn).to.equal(6);
  });
  it("can return Argdown error on pcs without preceding emptyline", function() {
    let source = `A
    (1)`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    //console.log(parser.errors[0]);
    expect(parser.errors).to.exist;
    expect(parser.errors.length).to.equal(1);
    const error = parser.errors[0];
    expect(error.name).to.equal("NotAllInputParsedException");
    expect(error.message).to.equal(INVALID_PCS_POSITION_ERROR);
    expect(error.token.startLine).to.equal(2);
    expect(error.token.startColumn).to.equal(1);
  });
  it("can return Argdown error on incomplete inference", function() {
    let source = `(1) a
    (2) b
    --
    (3) c`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    // expect(parser.errors).to.exist;
    // console.log(parser.errors[0]);
    // console.log(parser.errors[1]);
    expect(parser.errors.length).to.be.above(0);
    const error = parser.errors[0];
    expect(error.name).to.equal("MismatchedTokenException");
    expect(error.message).to.equal(MISSING_INFERENCE_END_ERROR);
    // error.token is EOF without token position
    // This is fixed in the ParserPlugin where the last token's position will be added to the EOF token.
    // This should be identical to the location of error.previousToken, but for some unknown reason it is not:
    // expect((<any>error).previousToken!.startLine).to.equal(4);
    // expect((<any>error).previousToken!.startColumn).to.equal(5);
  });
  it("accepts two asterisks surrounded by whitespace", function() {
    let source = `Test ** Test`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.be.exist;
    expect(parser.errors.length).to.equal(0);
  });
  it("accepts two underscores surrounded by whitespace", function() {
    let source = `Test __ Test`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.be.exist;
    expect(parser.errors.length).to.equal(0);
  });
  it("returns correct error for three asterisks surrounded by whitespace", function() {
    let source = `Test *** Test`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.be.exist;
    expect(parser.errors.length).to.equal(1);
    const error = parser.errors[0];
    expect(error.name).to.equal("MismatchedTokenException");
    expect(error.message).to.contain(
      "Incomplete bold text range. Append two asterisks"
    );
  });
  it("returns correct error for three asterisks surrounded by whitespace", function() {
    let source = `Test ___ Test`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.be.exist;
    expect(parser.errors.length).to.equal(1);
    const error = parser.errors[0];
    expect(error.name).to.equal("MismatchedTokenException");
    expect(error.message).to.contain(
      "Incomplete bold text range. Append two underscores"
    );
  });
  it("accepts four asterisks surrounded by whitespace", function() {
    let source = `Test **** Test`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.be.exist;
    expect(parser.errors.length).to.equal(0);
  });
  it("accepts four underscores surrounded by whitespace", function() {
    let source = `Test ____ Test`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    expect(parser.errors).to.be.exist;
    expect(parser.errors.length).to.equal(0);
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
    // console.log(tokensToString(lexResult.tokens));
    // console.log(astToString(ast));
    // console.log(parser.errors[0]);
    expect(parser.errors).to.be.empty;
    //console.log(astToString(ast));
    //console.log(astToJsonString(ast));
    expect(ast.children[0].startLine).to.equal(1); // Heading
    expect(ast.children[1].startLine).to.equal(3); // Statement
    expect(ast.children[2].startLine).to.equal(5); // Statement Definition
    expect(ast.children[2].children[1].children[1].startLine).to.equal(6); // Outgoing Support
    expect(ast.children[2].children[1].children[2].startLine).to.equal(7); // Outgoing Attack
    expect(ast.children[2].children[1].children[3].startLine).to.equal(8); // Incoming Support
    expect(ast.children[2].children[1].children[4].startLine).to.equal(9); // Incoming Attack
    expect(ast.children[3].startLine).to.equal(11); // Statement Reference
    expect(ast.children[3].children[2].children[1].startLine).to.equal(12); // Contradiction (previous sibling is Newline)
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
  it("can parse inference with rules", function() {
    let source = `
    (1) A
    --
    Some rule
    --
    (2) B
`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    // console.log(astToString(ast));
    // console.log(parser.errors);
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
    // console.log(astToString(ast));
    // console.log(parser.errors);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
    const pcsTail = ast.children[0].children[1];
    expect(pcsTail.children[1]).to.exist; // inference
    expect(pcsTail.children[1].name).to.equal("inference");
    expect(pcsTail.children[1].children[3]).to.exist; // relations (2 is newline)
    expect(pcsTail.children[1].children[3].name).to.equal("relations"); // relations
    expect(pcsTail.children[1].children[3].children[0].tokenType.name).to.equal(
      "Indent"
    );
    expect(pcsTail.children[1].children[3].children[1].name).to.equal(
      "outgoingUndercut"
    );
  });
  it("can parse bof newline comment emptyline", function() {
    let source = `
/* Comment */

A
`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    // console.log(tokensToString(lexResult.tokens));
    // console.log(astToString(ast));
    // console.log(parser.errors);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse frontmatter comment emptyline", function() {
    let source = `
===
title: Test
===
/* Comment */

A
`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    // console.log(tokensToString(lexResult.tokens));
    // console.log(astToString(ast));
    // console.log(parser.errors);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  it("can parse Argdown with metadata", function() {
    let source = `
# Heading 1 {test:1}

# Heading 2
   {test: 1}

A {test: 1}

B: asdasdds 
{test: 1}

<A>: test {test: 1}

<B >: asdasdasd
  	  {test: 1}


    (1) A
    --
    {test: 1}
    --
    (2) B
    -- {test:1} --
    (3) C
`;
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    // console.log(astToString(ast));
    // console.log(parser.errors);
    expect(lexResult.errors).to.be.empty;
    expect(parser.errors).to.be.empty;
  });
  //   it("can parse nested lists", () => {
  //     const input = `
  // # The central statements of the debate

  // * Atheist statements
  //     1. [Nietzsches Slogan]: God is dead.
  // * Deist statements
  //     2. [Intelligent Design]: The world is intelligently designed
  //     3. [Idea Perfect Being]: We have the idea of a perfect being.
  //     `;
  //     let lexResult = tokenize(input);
  //     parser.input = lexResult.tokens;
  //     parser.argdown();
  //     expect(lexResult.errors).to.be.empty;
  //     expect(parser.errors).to.be.empty;
  //   });
});

describe("ArgdownTreeWalker", function() {
  it("can walk", function() {
    let source = "Hallo Welt!";
    let lexResult = tokenize(source);
    parser.input = lexResult.tokens;
    let ast = parser.argdown();
    let statements = 0;
    walker.on("statementEntry", ({}, {}, node) => {
      statements++;
      expect(node.name).to.equal("statement");
    });
    walker.walk({}, { ast: ast }, new Logger());
    expect(statements).to.equal(1);
  });
});
