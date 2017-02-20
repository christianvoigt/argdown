'use strict';

var _chai = require('chai');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ArgdownLexer = require('../src/ArgdownLexer.js');

var _ArgdownLexer2 = _interopRequireDefault(_ArgdownLexer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Lexer", function () {
  it("recognizes incoming and outgoing relations", function () {
    var source = _fs2.default.readFileSync("./test/lexer-relations.argdown", 'utf8');
    var result = _ArgdownLexer2.default.tokenize(source);
    var tokens = result.tokens;
    (0, _chai.expect)(tokens[0]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[1]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingAttack);
    (0, _chai.expect)(tokens[2]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[3]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingAttack);
    (0, _chai.expect)(tokens[4]).to.be.an.instanceof(_ArgdownLexer2.default.IncomingSupport);
    (0, _chai.expect)(tokens[5]).to.be.an.instanceof(_ArgdownLexer2.default.IncomingAttack);
  });
  it("can distinguish between Emptyline and Newline", function () {
    var source = _fs2.default.readFileSync("./test/lexer-emptyline.argdown", 'utf8');
    var result = _ArgdownLexer2.default.tokenize(source);
    var tokens = result.tokens;
    (0, _chai.expect)(tokens[0]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[1]).to.be.an.instanceof(_ArgdownLexer2.default.Emptyline);
    (0, _chai.expect)(tokens[2]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[3]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[4]).to.be.an.instanceof(_ArgdownLexer2.default.Emptyline);
    (0, _chai.expect)(tokens[5]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
  });
  it("can dedent on Emptyline", function () {
    var source = _fs2.default.readFileSync("./test/lexer-emptyline-dedent.argdown", 'utf8');
    var result = _ArgdownLexer2.default.tokenize(source);
    var tokens = result.tokens;
    (0, _chai.expect)(tokens[0]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[1]).to.be.an.instanceof(_ArgdownLexer2.default.Indent);
    (0, _chai.expect)(tokens[2]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[3]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[4]).to.be.an.instanceof(_ArgdownLexer2.default.Dedent);
    (0, _chai.expect)(tokens[5]).to.be.an.instanceof(_ArgdownLexer2.default.Emptyline);
    (0, _chai.expect)(tokens[6]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
  });
  it("can ignore Newlines in relations", function () {
    var source = _fs2.default.readFileSync("./test/lexer-linebreak.argdown", 'utf8');
    var result = _ArgdownLexer2.default.tokenize(source);
    var tokens = result.tokens;
    (0, _chai.expect)(tokens[0]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[1]).to.be.an.instanceof(_ArgdownLexer2.default.Indent);
    (0, _chai.expect)(tokens[2]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[3]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[4]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[5]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingAttack);
    (0, _chai.expect)(tokens[6]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[7]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[8]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[9]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[10]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[11]).to.be.an.instanceof(_ArgdownLexer2.default.Dedent);
  });
  it("can lex complex indentation", function () {
    var source = _fs2.default.readFileSync("./test/lexer-indentation.argdown", 'utf8');
    var result = _ArgdownLexer2.default.tokenize(source);
    var tokens = result.tokens;
    (0, _chai.expect)(tokens[0]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[1]).to.be.an.instanceof(_ArgdownLexer2.default.Indent);
    (0, _chai.expect)(tokens[2]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[3]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[4]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingAttack);
    (0, _chai.expect)(tokens[5]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[6]).to.be.an.instanceof(_ArgdownLexer2.default.Indent);
    (0, _chai.expect)(tokens[7]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingSupport);
    (0, _chai.expect)(tokens[8]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[9]).to.be.an.instanceof(_ArgdownLexer2.default.Indent);
    (0, _chai.expect)(tokens[10]).to.be.an.instanceof(_ArgdownLexer2.default.OutgoingAttack);
    (0, _chai.expect)(tokens[11]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[12]).to.be.an.instanceof(_ArgdownLexer2.default.Indent);
    (0, _chai.expect)(tokens[13]).to.be.an.instanceof(_ArgdownLexer2.default.IncomingSupport);
    (0, _chai.expect)(tokens[14]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[15]).to.be.an.instanceof(_ArgdownLexer2.default.Dedent);
    (0, _chai.expect)(tokens[16]).to.be.an.instanceof(_ArgdownLexer2.default.Dedent);
    (0, _chai.expect)(tokens[17]).to.be.an.instanceof(_ArgdownLexer2.default.Dedent);
    (0, _chai.expect)(tokens[18]).to.be.an.instanceof(_ArgdownLexer2.default.IncomingAttack);
    (0, _chai.expect)(tokens[19]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
    (0, _chai.expect)(tokens[20]).to.be.an.instanceof(_ArgdownLexer2.default.Dedent);
  });
  it("can recognize argument and statement references and definitions", function () {
    var source = _fs2.default.readFileSync("./test/lexer-definitions-references.argdown", 'utf8');
    var result = _ArgdownLexer2.default.tokenize(source);
    var tokens = result.tokens;
    (0, _chai.expect)(tokens[0]).to.be.an.instanceof(_ArgdownLexer2.default.StatementReference);
    (0, _chai.expect)(tokens[1]).to.be.an.instanceof(_ArgdownLexer2.default.StatementDefinition);
    (0, _chai.expect)(tokens[2]).to.be.an.instanceof(_ArgdownLexer2.default.ArgumentReference);
    (0, _chai.expect)(tokens[3]).to.be.an.instanceof(_ArgdownLexer2.default.ArgumentDefinition);
    (0, _chai.expect)(tokens[4]).to.be.an.instanceof(_ArgdownLexer2.default.Freestyle);
  });
}); //import { before, after, describe, it } from 'mocha';
//# sourceMappingURL=lexer.spec.js.map