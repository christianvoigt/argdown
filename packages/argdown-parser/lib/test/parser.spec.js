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
    var parseResult = parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can parse complex argdown file", function () {
    var source = _fs2.default.readFileSync("./test/veggie_debate.argdown", 'utf8');
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var parseResult = parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can parse argument definitions and references", function () {
    var source = _fs2.default.readFileSync("./test/parser-arguments.argdown", 'utf8');
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var parseResult = parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
  });
  it("can return errors", function () {
    var source = "Text <Title>:\n\n+ text";
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var parseResult = parser.argdown();
    //console.log(parser.errors[0]);
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.exist;
  });
  it("can return error for incomplete reconstruction", function () {
    var source = 'sdsadad\n\n(1) adasdasd';
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var parseResult = parser.argdown();
    console.log(parser.errors[0]);
  });
  it("can escape characters", function () {
    var source = "<Title>: text \\[text\\]";
    var lexResult = lexer.tokenize(source);
    parser.input = lexResult.tokens;
    var parseResult = parser.argdown();
    (0, _chai.expect)(lexResult.errors).to.be.empty;
    (0, _chai.expect)(parser.errors).to.be.empty;
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
    var parseResult = parser.argdown();
    var statements = 0;
    walker.on('statementEntry', function (node) {
      statements++;(0, _chai.expect)(node.name).to.equal('statement');
    });
    walker.walk(parseResult);
    (0, _chai.expect)(statements).to.equal(1);
  });
});
//# sourceMappingURL=parser.spec.js.map