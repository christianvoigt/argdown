"use strict";

var _chai = require("chai");

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _ArgdownLexer = require("../src/ArgdownLexer.js");

var _chevrotain = require("chevrotain");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import { before, after, describe, it } from 'mocha';
var i = 0;
var currentTokens = null;
function expectToken(tokenType) {
    //expect(currentTokens[i]).to.be.an.instanceof(tokenType);
    (0, _chai.expect)((0, _chevrotain.tokenMatcher)(currentTokens[i], tokenType)).to.be.true;
    i++;
}
function expectTokenLocation(startOffset, endOffset, startLine, endLine, startColumn, endColumn) {
    var token = currentTokens[i];
    (0, _chai.expect)(token.startOffset).to.equal(startOffset);
    (0, _chai.expect)(token.endOffset).to.equal(endOffset);
    (0, _chai.expect)(token.startLine).to.equal(startLine);
    (0, _chai.expect)(token.endLine).to.equal(endLine);
    (0, _chai.expect)(token.startColumn).to.equal(startColumn);
    (0, _chai.expect)(token.endColumn).to.equal(endColumn);
    i++;
}
function startTest(tokens) {
    currentTokens = tokens;
    i = 0;
}
var lexer = _ArgdownLexer.ArgdownLexer;

describe("Lexer", function () {
    it("recognizes incoming and outgoing relations", function () {
        var source = _fs2.default.readFileSync("./test/lexer-relations.argdown", "utf8");
        var result = lexer.tokenize(source);
        //console.log(lexer.tokensToString(result.tokens));
        startTest(result.tokens);
        expectToken(lexer.OutgoingSupport);
        expectToken(lexer.OutgoingAttack);
        expectToken(lexer.OutgoingSupport);
        expectToken(lexer.OutgoingAttack);
        expectToken(lexer.IncomingSupport);
        expectToken(lexer.IncomingAttack);
        expectToken(lexer.Contradiction);
        expectToken(lexer.IncomingUndercut);
        expectToken(lexer.OutgoingUndercut);
    });
    it("can distinguish between Emptyline and Newline", function () {
        var source = _fs2.default.readFileSync("./test/lexer-emptyline.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-mentions.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-heading.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-lists.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-argument.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        expectToken(lexer.StatementNumber);
        expectToken(lexer.Freestyle);
        expectToken(lexer.StatementNumber);
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
        expectToken(lexer.StatementNumber);
        expectToken(lexer.Freestyle);
    });
    it("can dedent on Emptyline", function () {
        var source = _fs2.default.readFileSync("./test/lexer-emptyline-dedent.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-linebreak.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-italic-bold.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        // console.log(lexer.tokensToString(result.tokens));
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
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.AsteriskItalicStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskItalicEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.AsteriskItalicStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskItalicEnd);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskItalicStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskItalicEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.UnderscoreItalicStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.UnderscoreItalicEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.AsteriskBoldStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskBoldEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.UnderscoreBoldStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.UnderscoreBoldEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.AsteriskItalicStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskItalicEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.UnderscoreItalicStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.UnderscoreItalicEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.AsteriskBoldStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.AsteriskBoldEnd);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.UnderscoreBoldStart);
        expectToken(lexer.Freestyle);
        expectToken(lexer.UnderscoreBoldEnd);
        expectToken(lexer.UnusedControlChar);
    });
    it("can lex complex indentation", function () {
        var source = _fs2.default.readFileSync("./test/lexer-indentation.argdown", "utf8");
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
        var source = _fs2.default.readFileSync("./test/lexer-definitions-references.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        expectToken(lexer.StatementReference);
        expectToken(lexer.StatementDefinition);
        expectToken(lexer.ArgumentReference);
        expectToken(lexer.ArgumentDefinition);
        expectToken(lexer.Freestyle);
    });
    it("can ignore comments", function () {
        var source = _fs2.default.readFileSync("./test/lexer-comment.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Emptyline);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Freestyle);
    });
    it("can recognize links and tags", function () {
        var source = _fs2.default.readFileSync("./test/lexer-links-and-tags.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        //console.log(lexer.tokensToString(result.tokens));
        expectToken(lexer.StatementDefinition);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.Freestyle);
        expectToken(lexer.UnusedControlChar);
        expectToken(lexer.Link);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Tag);
        expectToken(lexer.Tag);
        expectToken(lexer.Tag);
    });
    it("can ignore trailing Emptyline before comment", function () {
        var source = _fs2.default.readFileSync("./test/lexer-trailing-emptyline.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        (0, _chai.expect)(result.tokens.length).to.equal(3);
        expectToken(lexer.Emptyline);
        expectToken(lexer.StatementDefinition);
        expectToken(lexer.Freestyle);
    });
    it("can lex Windows line endings", function () {
        var source = _fs2.default.readFileSync("./test/lexer-windows-line-endings.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        //console.log(lexer.tokensToString(result.tokens));
        //expect(result.tokens.length).to.equal(5);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Indent);
        expectToken(lexer.OutgoingSupport);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Dedent);
        expectToken(lexer.Emptyline);
        expectToken(lexer.StatementNumber);
        expectToken(lexer.Freestyle);
        expectToken(lexer.InferenceStart);
        expectToken(lexer.InferenceEnd);
        expectToken(lexer.StatementNumber);
        expectToken(lexer.Freestyle);
    });
    it("can lex escaped chars", function () {
        var source = _fs2.default.readFileSync("./test/lexer-escaped-chars.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        //console.log(lexer.tokensToString(result.tokens));
        //expect(result.tokens.length).to.equal(5);
        expectToken(lexer.Freestyle);
        expectToken(lexer.EscapedChar);
        expectToken(lexer.Freestyle);
        expectToken(lexer.EscapedChar);
        expectToken(lexer.Freestyle);
        expectToken(lexer.EscapedChar);
        expectToken(lexer.Freestyle);
        expectToken(lexer.EscapedChar);
        expectToken(lexer.EscapedChar);
        expectToken(lexer.Freestyle);
    });
    it("can save correct token location data", function () {
        var source = _fs2.default.readFileSync("./test/lexer-token-locations.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        //console.log(lexer.tokenLocationsToString(result.tokens));
        expectTokenLocation(0, 0, 1, 1, 1, 1);
        expectTokenLocation(2, 2, 2, 2, 1, 1); //offset = 2 because of ignored line break
        expectTokenLocation(4, 5, 3, 3, 1, 2);
        expectTokenLocation(6, 6, 3, 3, 3, 3);
        expectTokenLocation(7, 11, 3, 3, 4, 8); //@[A]
        expectTokenLocation(12, 12, 3, 3, 9, 9); //ItalicStart
        expectTokenLocation(13, 13, 3, 3, 10, 10);
        expectTokenLocation(14, 14, 3, 3, 11, 11); //ItalicEnd
        expectTokenLocation(15, 16, 3, 4, 12, 1); //Emptyline
        expectTokenLocation(17, 20, 5, 5, 1, 4); //<B>:
        expectTokenLocation(22, 22, 5, 5, 6, 6); //skipped whitespace at offset 21
        expectTokenLocation(24, 27, 6, 6, 1, 4); // Indent (4 spaces)
        expectTokenLocation(24, 28, 6, 6, 1, 5); // + (including 4 spaces for indentation)
        expectTokenLocation(30, 30, 6, 6, 7, 7);
        expectTokenLocation(32, 39, 7, 7, 1, 8); // Indent (8 spaces)
        expectTokenLocation(32, 41, 7, 7, 1, 10); // -> including spaces
        expectTokenLocation(43, 43, 7, 7, 12, 12); // skipped whitespace at offset 42
        expectTokenLocation(43, 43, 7, 7, 12, 12); // Dedent is always at last column of current line
        expectTokenLocation(43, 43, 7, 7, 12, 12); // Dedent is always at last column of current line
    });
    it("can save correct token location data if first line is empty", function () {
        var source = _fs2.default.readFileSync("./test/lexer-token-locations-first-line-empty.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        //console.log(lexer.tokenLocationsToString(result.tokens));
        //expect(result.tokens.length).to.equal(5);
        expectTokenLocation(1, 1, 2, 2, 1, 1); //First newline skipped
        expectTokenLocation(3, 3, 3, 3, 1, 1); //Second newline skipped
    });
    it("can lex relation after empty line", function () {
        var source = _fs2.default.readFileSync("./test/lexer-relation-after-emptyline.argdown", "utf8");
        var result = lexer.tokenize(source);
        startTest(result.tokens);
        //console.log(lexer.tokensToString(result.tokens));
        //expect(result.tokens.length).to.equal(5);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Emptyline);
        expectToken(lexer.Indent);
        expectToken(lexer.OutgoingSupport);
        expectToken(lexer.Freestyle);
        expectToken(lexer.Dedent);
    });
    // it("can lex statement references, definitions and mentions by number", function () {
    //   let source = fs.readFileSync("./test/lexer-statements-by-number.argdown", 'utf8');
    //   const result = lexer.tokenize(source);
    //   startTest(result.tokens);
    //   console.log(lexer.tokensToString(result.tokens));
    //   //expect(result.tokens.length).to.equal(5);
    //   expectToken(lexer.StatementDefinitionByNumber);
    //   expectToken(lexer.Freestyle);
    //   expectToken(lexer.StatementReferenceByNumber);
    //   expectToken(lexer.StatementMentionByNumber);
    //   // expectToken(lexer.Dedent);
    // });
});
//# sourceMappingURL=lexer.spec.js.map