'use strict';

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var createToken = chevrotain.createToken;
var Lexer = chevrotain.Lexer;
var getStartOffset = chevrotain.getStartOffset;

var whiteSpaceRegExp = /^[' '{2}\t]+/;

// State required for matching the indentations
var indentStack = [0];
var lastTextMatched = void 0;

function isStartOfLine(text, matchedTokens, groups) {
    var noTokensMatchedYet = _.isEmpty(matchedTokens);
    var newLines = groups.nl;
    var noNewLinesMatchedYet = _.isEmpty(newLines);
    var lastTokenIsEmptyline = _.last(matchedTokens) instanceof Emptyline;
    return noTokensMatchedYet || lastTokenIsEmptyline ||
    // Both newlines and other Tokens have been matched AND the last matched Token is a newline
    !noTokensMatchedYet && !noNewLinesMatchedYet && getStartOffset(_.last(newLines)) > getStartOffset(_.last(matchedTokens));
}

function matchIndentBase(text, matchedTokens, groups, type) {
    // indentation can only be matched at the start of a line.
    if (isStartOfLine(text, matchedTokens, groups)) {
        var isFirstLine = matchedTokens.length == 0 && groups.nl.length == 0;
        var match = void 0;
        var currIndentLevel = undefined;
        var isZeroIndent = text.length > 0 && text[0] !== " ";
        if (isZeroIndent) {
            // Matching zero spaces Outdent would not consume any chars, thus it would cause an infinite loop.
            // This check prevents matching a sequence of zero spaces outdents.
            if (lastTextMatched !== text) {
                currIndentLevel = 0;
                match = [""];
                lastTextMatched = text;
            }
        }
        // possible non-empty indentation
        else {
                match = whiteSpaceRegExp.exec(text);
                if (match !== null) {
                    currIndentLevel = match[0].length;
                }
            }

        if (currIndentLevel !== undefined) {
            var lastIndentLevel = _.last(indentStack);
            if (currIndentLevel > lastIndentLevel && type === "indent") {
                indentStack.push(currIndentLevel);
                return match;
            } else if (currIndentLevel < lastIndentLevel && type === "outdent") {
                //if we need more than one outdent token, add all but the last one
                if (indentStack.length > 2) {
                    var image = "";
                    var offset = chevrotain.getEndOffset(_.last(matchedTokens)) + 1;
                    var line = !isFirstLine ? chevrotain.getEndLine(_.last(matchedTokens)) : chevrotain.getEndLine(_.last(matchedTokens)) + 1;
                    var column = chevrotain.getEndColumn(_.last(matchedTokens)) + 1;
                    while (indentStack.length > 2 &&
                    //stop before the last Outdent
                    indentStack[indentStack.length - 2] > currIndentLevel) {
                        indentStack.pop();
                        matchedTokens.push(new Outdent(image, offset, line, column));
                    }
                }
                indentStack.pop();
                return match;
            } else {
                // same indent, this should be lexed as simple whitespace and ignored
                return null;
            }
        } else {
            // indentation cannot be matched without at least one space character.
            return null;
        }
    } else {
        // indentation cannot be matched under other circumstances
        return null;
    }
}

// customize matchIndentBase to create separate functions of Indent and Outdent.
var matchIndent = _.partialRight(matchIndentBase, "indent");
var matchOutdent = _.partialRight(matchIndentBase, "outdent");

function matchRelation(text, matchedTokens, groups, pattern) {
    if (isStartOfLine(text, matchedTokens, groups) || _.last(matchedTokens) instanceof Indent) {
        return pattern.exec(text);
    }
    return null;
}

var matchIncomingSupport = _.partialRight(matchRelation, /^'\+>'/);
var matchIncomingAttack = _.partialRight(matchRelation, /^'->'/);
var matchOutgoingSupport = _.partialRight(matchRelation, /^<?'\+'/);
var matchOutgoingAttack = _.partialRight(matchRelation, /^<?'\-'/);

var IncomingSupport = createToken({
    name: "IncomingSupport",
    pattern: matchIncomingSupport
});

var IncomingAttack = createToken({
    name: "IncomingAttack",
    pattern: matchIncomingAttack
});

var OutgoingSupport = createToken({
    name: "OutgoingSupport",
    pattern: matchOutgoingSupport
});

var OutgoingAttack = createToken({
    name: "OutgoingAttack",
    pattern: matchOutgoingAttack
});

var Spaces = createToken({
    name: "Spaces",
    pattern: / +/,
    group: Lexer.SKIPPED
});

var Emptyline = createToken({
    name: "Emptyline",
    pattern: /(\n\r|\n|\r){2,}/
});

// newlines are not skipped, by setting their group to "nl" they are saved in the lexer result
// and thus we can check before creating an indentation token that the last token matched was a newline.
var Newline = createToken({
    name: "Newline",
    pattern: /\n\r|\n|\r/,
    group: "nl"
});

// define the indentation tokens using custom token patterns
var Indent = createToken({
    name: "Indent",
    pattern: matchIndent
});
var Outdent = createToken({
    name: "Outdent",
    pattern: matchOutdent
});

var Char = createToken({
    name: "Char",
    pattern: /./
});

var customPatternLexer = new Lexer([Emptyline, Newline,
// indentation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
// Outdent must appear before Indent for handling zero spaces outdents.
Outdent, Indent, IncomingSupport, IncomingAttack, OutgoingSupport, OutgoingAttack, Spaces, Char]);

module.exports = {

    // for testing purposes
    Emptyline: Emptyline,
    Newline: Newline,
    Indent: Indent,
    Outdent: Outdent,
    Spaces: Spaces,
    IncomingSupport: IncomingSupport,
    IncomingAttack: IncomingAttack,
    OutgoingSupport: OutgoingSupport,
    OutgoingAttack: OutgoingAttack,
    Char: Char,

    tokenize: function tokenize(text) {

        // have to reset the indent stack between processing of different text inputs
        indentStack = [0];
        lastTextMatched = undefined;

        var lexResult = customPatternLexer.tokenize(text);

        var lastToken = _.last(lexResult.tokens);
        var lastOffset = chevrotain.getEndOffset(lastToken);
        var lastLine = chevrotain.getEndLine(lastToken);
        var lastColumn = chevrotain.getEndColumn(lastToken);

        //add remaining Outdents
        while (indentStack.length > 1) {
            lexResult.tokens.push(new Outdent("", lastOffset, lastLine, lastColumn));
            indentStack.pop();
        }

        if (lexResult.errors.length > 0) {
            throw new Error("sad sad panda lexing errors detected");
        }
        return lexResult;
    }
};
//# sourceMappingURL=index.js.map