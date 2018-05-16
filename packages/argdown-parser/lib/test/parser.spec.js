'use strict';

var _chai = require('chai');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('../src/index.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lexer = _index.ArgdownLexer; //import { before, after, describe, it } from 'mocha';

var parser = _index.ArgdownParser;
var walker = new _index.ArgdownTreeWalker();

describe("Parser", function () {
  it("can parse argdown with leading and trailing emptylines", function () {
    var source = "\n\n\n\n\nHallo World!\n\n\n<!-- Comment -->\n\n";
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can parse complex argdown file", function () {
    var source = _fs2.default.readFileSync("./test/veggie_debate.argdown", 'utf8');
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can parse argument definitions and references", function () {
    var source = _fs2.default.readFileSync("./test/parser-arguments.argdown", 'utf8');
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can return errors", function () {
    var source = "Text <Title>:\n\n+ text";
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    //console.log(parser.errors[0]);
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.exist;
  });
  it("can escape characters", function () {
    var source = "<Title>: text \\[text\\]";
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can add line numbers", function () {
    var source = '# Heading\n\nStatement\n\n[Statement Definition]: Bla\n    + support relation\n    - attack relation\n    +> incoming support\n    -> incoming attack\n\n[Statement Reference] \n  >< Contradiction\n\n<Argument Definition>: Bla\n\n<Argument Reference>\n\n(1) A\n(2) B\n----\n(3) C\n\n 1. A\n 2. B\n\n * A\n * B\n';
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var ast = parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
    //console.log(parser.astToJsonString(ast));
    (0, _chai.expect)(ast.children[0].startLine).to.equal(1); // Heading
    (0, _chai.expect)(ast.children[1].startLine).to.equal(3); // Statement
    (0, _chai.expect)(ast.children[2].startLine).to.equal(5); // Statement Definition
    (0, _chai.expect)(ast.children[2].children[1].children[1].startLine).to.equal(6); // Outgoing Support
    (0, _chai.expect)(ast.children[2].children[1].children[2].startLine).to.equal(7); // Outgoing Attack
    (0, _chai.expect)(ast.children[2].children[1].children[3].startLine).to.equal(8); // Incoming Support
    (0, _chai.expect)(ast.children[2].children[1].children[4].startLine).to.equal(9); // Incoming Attack
    (0, _chai.expect)(ast.children[3].startLine).to.equal(11); // Statement Reference
    (0, _chai.expect)(ast.children[3].children[1].children[2].startLine).to.equal(12); // Contradiction
    (0, _chai.expect)(ast.children[4].startLine).to.equal(14); // Argument Definition
    (0, _chai.expect)(ast.children[5].startLine).to.equal(16); // Argument Reference
    (0, _chai.expect)(ast.children[6].children[0].startLine).to.equal(18); // Argument Statement 1
    (0, _chai.expect)(ast.children[6].children[1].children[0].startLine).to.equal(19); // Argument Statement 2
    (0, _chai.expect)(ast.children[6].children[1].children[1].startLine).to.equal(20); // Inference
    (0, _chai.expect)(ast.children[6].children[1].children[2].startLine).to.equal(21); // Argument Statement 3
    (0, _chai.expect)(ast.children[7].children[1].startLine).to.equal(23); // Ordered List item 1
    (0, _chai.expect)(ast.children[7].children[2].startLine).to.equal(24); // Ordered List item 2
    (0, _chai.expect)(ast.children[8].children[1].startLine).to.equal(26); // Unordered List item 1
    (0, _chai.expect)(ast.children[8].children[2].startLine).to.equal(27); // Unordered List item 2
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

describe("ArgdownTreeWalker", function () {
  it("can walk", function () {
    var source = "Hallo Welt!";
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var ast = parser.argdown();
    var statements = 0;
    walker.on('statementEntry', function (request, response, node) {
      statements++;(0, _chai.expect)(node.name).to.equal('statement');
    });
    walker.walk({}, { ast: ast });
    (0, _chai.expect)(statements).to.equal(1);
  });
});
//# sourceMappingURL=parser.spec.js.map