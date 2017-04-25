'use strict';

var _chai = require('chai');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ArgdownLexer = require('../src/ArgdownLexer.js');

var _chevrotain = require('chevrotain');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { before, after, describe, it } from 'mocha';
var i = 0;
var currentTokens = null;
function expectToken(tokenType) {
  //expect(currentTokens[i]).to.be.an.instanceof(tokenType);
  (0, _chai.expect)((0, _chevrotain.tokenMatcher)(currentTokens[i], tokenType)).to.be.true;
  i++;
}
function startTest(tokens) {
  currentTokens = tokens;
  i = 0;
}
var lexer = _ArgdownLexer.ArgdownLexer;

describe("Lexer", function () {
  it("recognizes incoming and outgoing relations", function () {
    var source = _fs2.default.readFileSync("./test/lexer-relations.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.IncomingSupport);
    expectToken(lexer.IncomingAttack);
  });
  it("can distinguish between Emptyline and Newline", function () {
    var source = _fs2.default.readFileSync("./test/lexer-emptyline.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
  });
  it("can lex mentions", function () {
    var source = _fs2.default.readFileSync("./test/lexer-mentions.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ArgumentMention);
    expectToken(lexer.StatementMention);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.ArgumentMention);
    expectToken(lexer.StatementMention);
  });
  it("can lex headings", function () {
    var source = _fs2.default.readFileSync("./test/lexer-heading.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.HeadingStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
  });
  it("can lex ordered and unordered lists", function () {
    var source = _fs2.default.readFileSync("./test/lexer-lists.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Indent);
    expectToken(lexer.UnorderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.UnorderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Indent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.OrderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.UnorderedListItem);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
  });
  it("can lex an argument reconstruction", function () {
    var source = _fs2.default.readFileSync("./test/lexer-argument.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.ArgumentStatementStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ArgumentStatementStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.InferenceStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ListDelimiter);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetadataStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Colon);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ListDelimiter);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetadataStatementEnd);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Colon);
    expectToken(lexer.Freestyle);
    expectToken(lexer.ListDelimiter);
    expectToken(lexer.Freestyle);
    expectToken(lexer.MetadataEnd);
    expectToken(lexer.InferenceEnd);
    expectToken(lexer.ArgumentStatementStart);
    expectToken(lexer.Freestyle);
  });
  it("can dedent on Emptyline", function () {
    var source = _fs2.default.readFileSync("./test/lexer-emptyline-dedent.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
  });
  it("can ignore Newlines in relations", function () {
    var source = _fs2.default.readFileSync("./test/lexer-linebreak.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
  });
  it("can lex bold and italic text", function () {
    var source = _fs2.default.readFileSync("./test/lexer-italic-bold.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.UnderscoreItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreItalicEnd);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.UnderscoreItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreItalicEnd);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.AsteriskItalicStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnderscoreBoldEnd);
    expectToken(lexer.AsteriskItalicEnd);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.AsteriskBoldStart);
    expectToken(lexer.Freestyle);
    expectToken(lexer.AsteriskBoldEnd);
    expectToken(lexer.AsteriskBoldEnd);
  });
  it("can lex complex indentation", function () {
    var source = _fs2.default.readFileSync("./test/lexer-indentation.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.OutgoingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Indent);
    expectToken(lexer.IncomingSupport);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.Dedent);
    expectToken(lexer.IncomingAttack);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Dedent);
  });
  it("can recognize argument and statement references and definitions", function () {
    var source = _fs2.default.readFileSync("./test/lexer-definitions-references.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.StatementReference);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.ArgumentReference);
    expectToken(lexer.ArgumentDefinition);
    expectToken(lexer.Freestyle);
  });
  it("can ignore comments", function () {
    var source = _fs2.default.readFileSync("./test/lexer-comment.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Emptyline);
    expectToken(lexer.Freestyle);
    expectToken(lexer.Freestyle);
  });
  it("can recognize links", function () {
    var source = _fs2.default.readFileSync("./test/lexer-links.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.Freestyle);
    expectToken(lexer.UnusedControlChar);
    expectToken(lexer.Link);
    expectToken(lexer.Freestyle);
  });
  it("can ignore trailing Emptyline before comment", function () {
    var source = _fs2.default.readFileSync("./test/lexer-trailing-emptyline.argdown", 'utf8');
    var result = lexer.tokenize(source);
    startTest(result.tokens);
    (0, _chai.expect)(result.tokens.length).to.equal(3);
    expectToken(lexer.Emptyline);
    expectToken(lexer.StatementDefinition);
    expectToken(lexer.Freestyle);
  });
});
//# sourceMappingURL=lexer.spec.js.map