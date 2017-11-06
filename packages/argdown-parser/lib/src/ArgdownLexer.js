'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createToken = chevrotain.createToken;
var createTokenInstance = chevrotain.createTokenInstance;
var tokenMatcher = chevrotain.tokenMatcher;
var getTokenConstructor = chevrotain.getTokenConstructor;

var ArgdownLexer = function () {
    _createClass(ArgdownLexer, [{
        key: 'init',
        value: function init() {
            // State required for matching the indentations
            this.indentStack = [0];
            // State require for matching bold and italic ranges in the right order
            this.rangesStack = [];
        }
    }, {
        key: 'getCurrentLine',
        value: function getCurrentLine(matchedTokens) {
            var matchedTokensIsEmpty = _.isEmpty(matchedTokens);
            if (matchedTokensIsEmpty) return 0;

            var last = _.last(matchedTokens);
            var currentLine = last ? last.endLine : 0;
            if (last && chevrotain.tokenMatcher(last, this.Emptyline)) currentLine++;
            return currentLine;
        }
    }, {
        key: 'emitRemainingDedentTokens',
        value: function emitRemainingDedentTokens(matchedTokens) {
            if (this.indentStack.length <= 1) return;
            var lastToken = _.last(matchedTokens.tokens);
            var startOffset = lastToken ? lastToken.endOffset : 0;
            var endOffset = startOffset;
            var startLine = lastToken ? lastToken.endLine : 0;
            var endLine = startLine;
            var startColumn = lastToken ? lastToken.endColumn : 0;
            var endColumn = startColumn;

            //add remaining Dedents
            while (this.indentStack.length > 1) {
                matchedTokens.push(createTokenInstance(this.Dedent, "", startOffset, endOffset, startLine, endLine, startColumn, endColumn));
                this.indentStack.pop();
            }
        }
    }, {
        key: 'emitIndentOrDedent',
        value: function emitIndentOrDedent(matchedTokens, groups, indentStr) {
            var currIndentLevel = indentStr.length;
            var lastIndentLevel = _.last(this.indentStack);
            var image = "";
            var last = _.last(matchedTokens);
            var startOffset = last ? last.endOffset + 1 : 0;
            var endOffset = startOffset;
            var startLine = this.getCurrentLine(matchedTokens, groups.nl);
            var endLine = startLine;
            var startColumn = last ? last.endColumn + 1 : 0;
            var endColumn = startColumn;
            if (currIndentLevel > lastIndentLevel) {
                this.indentStack.push(currIndentLevel);
                var indentToken = createTokenInstance(this.Indent, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn);
                matchedTokens.push(indentToken);
            } else if (currIndentLevel < lastIndentLevel) {
                while (this.indentStack.length > 1 && currIndentLevel < _.last(this.indentStack)) {
                    this.indentStack.pop();
                    var dedentToken = createTokenInstance(this.Dedent, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn);
                    matchedTokens.push(dedentToken);
                }
            }
        }
    }]);

    function ArgdownLexer() {
        _classCallCheck(this, ArgdownLexer);

        var $ = this;
        $.tokens = []; //token list for the parser

        function matchRelation(text, offset, matchedTokens, groups, pattern) {
            var remainingText = text.substr(offset);
            var startsWithNewline = /^(?:\r\n|\n|\r)/.exec(remainingText) != null;
            if (_.isEmpty(matchedTokens) || startsWithNewline) {
                var match = pattern.exec(remainingText);
                if (match !== null && match.length == 3) {
                    var indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }
        //relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)
        var matchIncomingSupport = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(\+>)/);
        var matchIncomingAttack = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(->)/);
        var matchOutgoingSupport = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(<?\+)/);
        var matchOutgoingAttack = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(<?-)/);
        var matchContradiction = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(><)/);

        $.IncomingSupport = createToken({
            name: "IncomingSupport",
            pattern: matchIncomingSupport
        });
        $.tokens.push($.IncomingSupport);

        $.IncomingAttack = createToken({
            name: "IncomingAttack",
            pattern: matchIncomingAttack
        });
        $.tokens.push($.IncomingAttack);

        $.OutgoingSupport = createToken({
            name: "OutgoingSupport",
            pattern: matchOutgoingSupport
        });
        $.tokens.push($.OutgoingSupport);

        $.OutgoingAttack = createToken({
            name: "OutgoingAttack",
            pattern: matchOutgoingAttack
        });
        $.tokens.push($.OutgoingAttack);

        $.Contradiction = createToken({
            name: "Contradiction",
            pattern: matchContradiction
        });
        $.tokens.push($.Contradiction);

        var inferenceStartPattern = /^[\r\n|\n|\r]?[' '\t]*-{2}/;

        function matchInferenceStart(text, offset, matchedTokens) {
            var remainingText = text.substr(offset);
            var startsWithNewline = /^[\r\n|\n|\r]/.exec(remainingText) != null;
            if (_.isEmpty(matchedTokens) || startsWithNewline) {
                var match = inferenceStartPattern.exec(remainingText);
                if (match != null) {
                    $.emitRemainingDedentTokens(matchedTokens);
                    return match;
                }
            }
            return null;
        }
        $.InferenceStart = createToken({
            name: "InferenceStart",
            pattern: matchInferenceStart,
            push_mode: "inference_mode"
        });
        $.tokens.push($.InferenceStart);

        $.Colon = createToken({
            name: "Colon",
            pattern: /:/
        });
        $.tokens.push($.Colon);
        $.ListDelimiter = createToken({
            name: "ListDelimiter",
            pattern: /,/
        });
        $.tokens.push($.ListDelimiter);
        $.MetadataStatementEnd = createToken({
            name: "MetadataStatementEnd",
            pattern: /;/
        });
        $.tokens.push($.MetadataStatementEnd);
        $.MetadataStart = createToken({
            name: "MetadataStart",
            pattern: /\(/
        });
        $.tokens.push($.MetadataStart);
        $.MetadataEnd = createToken({
            name: "MetadataEnd",
            pattern: /\)/
        });
        $.tokens.push($.MetadataEnd);

        $.InferenceEnd = createToken({
            name: "InferenceEnd",
            pattern: /-{2,}/,
            pop_mode: true
        });
        $.tokens.push($.InferenceEnd);

        function matchListItem(text, offset, matchedTokens, groups, pattern) {
            var remainingText = text.substr(offset);
            var startsWithNewline = /^[\r\n|\n|\r]/.exec(remainingText) != null;
            var last = _.last(matchedTokens);
            var afterEmptyline = last && tokenMatcher(last, $.Emptyline);
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                var match = pattern.exec(remainingText);
                if (match !== null) {
                    var indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }

        var orderedListItemPattern = /^(?:\r\n|\n|\r)?([' '\t]+)\d+\.(?=\s)/;
        var matchOrderedListItem = _.partialRight(matchListItem, orderedListItemPattern);

        $.OrderedListItem = createToken({
            name: "OrderedListItem",
            pattern: matchOrderedListItem
        });
        $.tokens.push($.OrderedListItem);
        //whitespace + * + whitespace (to distinguish list items from bold and italic ranges)
        var unorderedListItemPattern = /^(?:\r\n|\n|\r)?([' '\t]+)\*(?=\s)/; //Newline +
        var matchUnorderedListItem = _.partialRight(matchListItem, unorderedListItemPattern);

        $.UnorderedListItem = createToken({
            name: "UnorderedListItem",
            pattern: matchUnorderedListItem
        });
        $.tokens.push($.UnorderedListItem);

        var argumentStatementStartPattern = /^(?:\r\n|\n|\r)?[' '\t]*\(\d+\)/;

        function matchArgumentStatementStart(text, offset, matchedTokens) {
            var remainingText = text.substr(offset);
            var startsWithNewline = /^(?:\r\n|\n|\r)/.exec(remainingText) != null;
            var last = _.last(matchedTokens);
            var afterEmptyline = last && tokenMatcher(last, $.Emptyline);
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                var match = argumentStatementStartPattern.exec(remainingText);
                if (match) {
                    $.emitRemainingDedentTokens(matchedTokens);
                    return match;
                }
            }
            return null;
        }

        $.ArgumentStatementStart = createToken({
            name: "ArgumentStatementStart",
            pattern: matchArgumentStatementStart
        });
        $.tokens.push($.ArgumentStatementStart);

        //This does not work with \r\n|\n||r as a simple CRLF linebreak will be interpreted as an Emptyline
        //Instead we drop the last alternative (\r?\n would work as well)
        var emptylinePattern = /^((?:\r\n|\n)[ \t]*(?:\r\n|\n)+)/; //two or more linebreaks
        function matchEmptyline(text, offset, matchedTokens) {
            var remainingText = text.substr(offset);
            var last = _.last(matchedTokens);
            //ignore Emptylines after first one (relevant for Emptylines after ignored comments)
            if (last && tokenMatcher(last, $.Emptyline)) return null;
            var match = emptylinePattern.exec(remainingText);
            if (match !== null && match[0].length < remainingText.length) {
                //ignore trailing linebreaks
                $.emitRemainingDedentTokens(matchedTokens);
                //TODO: emitRemainingRanges (to be more resistant against unclosed bold and italic ranges)
                return match;
            }
            return null;
        }
        $.Emptyline = createToken({
            name: "Emptyline",
            pattern: matchEmptyline
        });
        $.tokens.push($.Emptyline);

        //Indent and Dedent are never matched with their own patterns, instead they get matched in the relations custom patterns
        $.Indent = createToken({
            name: "Indent",
            pattern: chevrotain.Lexer.NA
        });
        $.tokens.push($.Indent);

        $.Dedent = createToken({
            name: "Dedent",
            pattern: chevrotain.Lexer.NA
        });
        $.tokens.push($.Dedent);

        $.StatementDefinition = createToken({
            name: "StatementDefinition",
            pattern: /\[.+?\]\:/
        });
        $.tokens.push($.StatementDefinition);

        $.StatementReference = createToken({
            name: "StatementReference",
            pattern: /\[.+?\]/
        });
        $.tokens.push($.StatementReference);

        $.StatementMention = createToken({
            name: "StatementMention",
            pattern: /\@\[.+?\][ \t]?/
        });
        $.tokens.push($.StatementMention);

        $.ArgumentDefinition = createToken({
            name: "ArgumentDefinition",
            pattern: /\<.+?\>\:/
        });
        $.tokens.push($.ArgumentDefinition);

        $.ArgumentReference = createToken({
            name: "ArgumentReference",
            pattern: /\<.+?\>/
        });
        $.tokens.push($.ArgumentReference);

        $.ArgumentMention = createToken({
            name: "ArgumentMention",
            pattern: /\@\<.+?\>[ \t]?/
        });
        $.tokens.push($.ArgumentMention);

        var headingPattern = /^(#+)/;
        function matchHeadingStart(text, offset, matchedTokens) {
            var remainingText = text.substr(offset);
            var last = _.last(matchedTokens);
            var afterEmptyline = last && tokenMatcher(last, $.Emptyline);

            if (!last || afterEmptyline) {
                return headingPattern.exec(remainingText);
            }
            return null;
        }
        $.HeadingStart = createToken({
            name: "HeadingStart",
            pattern: matchHeadingStart
        });
        $.tokens.push($.HeadingStart);

        //BOLD and ITALIC ranges
        function matchBoldOrItalicStart(text, offset, matchedTokens, groups, pattern, rangeType) {
            var remainingText = text.substr(offset);
            var match = pattern.exec(remainingText);
            if (match != null) {
                $.rangesStack.push(rangeType);
            }
            return match;
        }

        function matchBoldOrItalicEnd(text, offset, matchedTokens, groups, pattern, rangeType) {
            var lastRange = _.last($.rangesStack);
            if (lastRange != rangeType) return null;
            //first check if the last match was skipped Whitespace
            var skipped = groups[chevrotain.Lexer.SKIPPED];
            var lastSkipped = _.last(skipped);
            var lastMatched = _.last(matchedTokens);
            if (!lastMatched || lastSkipped && chevrotain.getEndOffset(lastSkipped) > chevrotain.getEndOffset(lastMatched)) {
                return null;
            }
            var remainingText = text.substr(offset);
            var match = pattern.exec(remainingText);

            if (match != null) {
                $.rangesStack.pop();
            }

            return match;
        }
        var matchAsteriskBoldStart = _.partialRight(matchBoldOrItalicStart, /^\*\*(?!\s)/, "AsteriskBold");
        var matchAsteriskBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^\*\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|\*|$))/, "AsteriskBold");

        var matchUnderscoreBoldStart = _.partialRight(matchBoldOrItalicStart, /^__(?!\s)/, "UnderscoreBold");
        var matchUnderscoreBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^__(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|\*|$))/, "UnderscoreBold");

        var matchAsteriskItalicStart = _.partialRight(matchBoldOrItalicStart, /^\*(?!\s)/, "AsteriskItalic");
        var matchAsteriskItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|\*|$))/, "AsteriskItalic");

        var matchUnderscoreItalicStart = _.partialRight(matchBoldOrItalicStart, /^\_(?!\s)/, "UnderscoreItalic");
        var matchUnderscoreItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\_(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|\*|$))/, "UnderscoreItalic");

        $.AsteriskBoldStart = createToken({
            name: "AsteriskBoldStart",
            pattern: matchAsteriskBoldStart
        });
        $.tokens.push($.AsteriskBoldStart);

        $.AsteriskBoldEnd = createToken({
            name: "AsteriskBoldEnd",
            pattern: matchAsteriskBoldEnd
        });
        $.tokens.push($.AsteriskBoldEnd);

        $.UnderscoreBoldStart = createToken({
            name: "UnderscoreBoldStart",
            pattern: matchUnderscoreBoldStart
        });
        $.tokens.push($.UnderscoreBoldStart);

        $.UnderscoreBoldEnd = createToken({
            name: "UnderscoreBoldEnd",
            pattern: matchUnderscoreBoldEnd
        });
        $.tokens.push($.UnderscoreBoldEnd);

        $.AsteriskItalicStart = createToken({
            name: "AsteriskItalicStart",
            pattern: matchAsteriskItalicStart
        });
        $.tokens.push($.AsteriskItalicStart);

        $.AsteriskItalicEnd = createToken({
            name: "AsteriskItalicEnd",
            pattern: matchAsteriskItalicEnd
        });
        $.tokens.push($.AsteriskItalicEnd);

        $.UnderscoreItalicStart = createToken({
            name: "UnderscoreItalicStart",
            pattern: matchUnderscoreItalicStart
        });
        $.tokens.push($.UnderscoreItalicStart);

        $.UnderscoreItalicEnd = createToken({
            name: "UnderscoreItalicEnd",
            pattern: matchUnderscoreItalicEnd
        });
        $.tokens.push($.UnderscoreItalicEnd);

        $.Comment = createToken({
            name: "Comment",
            pattern: /<!--(?:.|\n|\r)*?-->/,
            group: chevrotain.Lexer.SKIPPED
        });
        $.tokens.push($.Comment);

        $.Link = createToken({
            name: "Link",
            pattern: /\[[^\]]+?\]\([^\)]+?\)[ \t]?/
        });
        $.tokens.push($.Link);

        $.Tag = createToken({
            name: "Tag",
            pattern: /#(?:\([^\)]+\)|[a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)[ \t]?/
        });
        $.tokens.push($.Tag);

        $.Newline = createToken({
            name: "Newline",
            pattern: /(?:\r\n|\n|\r)/,
            group: chevrotain.Lexer.SKIPPED
        });
        $.tokens.push($.Newline);

        $.Spaces = createToken({
            name: "Spaces",
            pattern: /( |\t)+/,
            group: chevrotain.Lexer.SKIPPED
        });
        $.tokens.push($.Spaces);

        //The rest of the text that is free of any Argdown syntax
        $.Freestyle = createToken({
            name: "Freestyle",
            pattern: /[^\@\#\*\_\[\]\,\:\;\<\/\>\-\r\n\(\)]+/
        });
        $.tokens.push($.Freestyle);

        //Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
        //Otherwise, every line would simply be lexed as a single Freestyle token.
        //If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
        //Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.
        $.UnusedControlChar = createToken({
            name: "UnusedControlChar",
            pattern: /[\@\#\*\_\[\]\,\:\;\<\/\>\-\(\)][ \t]?/
        });
        $.tokens.push($.UnusedControlChar);

        var lexerConfig = {
            modes: {
                "default_mode": [$.Comment, $.Emptyline,
                // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
                // Dedent must appear before Indent for handling zero spaces dedents.
                $.Dedent, $.Indent, $.InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
                $.IncomingSupport, $.IncomingAttack, $.OutgoingSupport, $.OutgoingAttack, $.Contradiction, $.HeadingStart, $.ArgumentStatementStart, $.OrderedListItem, $.UnorderedListItem,
                //The ends of Bold and italic ranges need to be lexed before the starts
                $.AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
                $.UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
                $.AsteriskItalicEnd, $.UnderscoreItalicEnd,
                //The starts of Bold and italic ranges need to be lexed after the ends
                $.AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
                $.UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
                $.AsteriskItalicStart, $.UnderscoreItalicStart, $.Link, //needs to be lexed before StatementReference
                $.Tag, $.StatementDefinition, $.StatementReference, $.StatementMention, $.ArgumentDefinition, $.ArgumentReference, $.ArgumentMention, $.Newline, $.Spaces, $.Freestyle, $.UnusedControlChar],
                "inference_mode": [$.Comment, $.InferenceEnd, $.MetadataStart, $.MetadataEnd, $.MetadataStatementEnd, $.ListDelimiter, $.Colon, $.Newline, $.Spaces, $.Freestyle, $.UnusedControlChar]
            },

            defaultMode: "default_mode"
        };

        this._lexer = new chevrotain.Lexer(lexerConfig);
    }

    _createClass(ArgdownLexer, [{
        key: 'tokensToString',
        value: function tokensToString(tokens) {
            var str = "";
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var token = _step.value;

                    str += getTokenConstructor(token).tokenName + " " + token.image + "\n";
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return str;
        }
    }, {
        key: 'tokenize',
        value: function tokenize(text) {
            this.init();

            var lexResult = this._lexer.tokenize(text);
            if (lexResult.errors.length > 0) {
                throw new Error("sad sad panda lexing errors detected");
            }

            //remove trailing Emptyline (parser cannot cope with it)
            if (tokenMatcher(_.last(lexResult.tokens), this.Emptyline)) {
                lexResult.tokens.pop();
            }

            this.emitRemainingDedentTokens(lexResult.tokens);

            return lexResult;
        }
    }]);

    return ArgdownLexer;
}();

module.exports = {
    ArgdownLexer: new ArgdownLexer()
};
//# sourceMappingURL=ArgdownLexer.js.map