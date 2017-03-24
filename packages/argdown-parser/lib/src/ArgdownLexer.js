'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var createToken = chevrotain.createToken;

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
            var currentLine = chevrotain.getEndLine(last);
            if (chevrotain.tokenMatcher(last, this.Emptyline)) currentLine++;
            return currentLine;
        }
    }, {
        key: 'emitRemainingDedentTokens',
        value: function emitRemainingDedentTokens(matchedTokens) {
            if (this.indentStack.length <= 1) return;
            var lastToken = _.last(matchedTokens.tokens);
            var lastOffset = lastToken ? chevrotain.getEndOffset(lastToken) : 0;
            var lastLine = lastToken ? chevrotain.getEndLine(lastToken) : 0;
            var lastColumn = lastToken ? chevrotain.getEndColumn(lastToken) : 0;

            //add remaining Dedents
            while (this.indentStack.length > 1) {
                matchedTokens.push(new this.Dedent("", lastOffset, lastLine, lastColumn));
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
            var offset = last ? chevrotain.getEndOffset(last) + 1 : 0;
            var line = this.getCurrentLine(matchedTokens, groups.nl);
            var column = last ? chevrotain.getEndColumn(last) + 1 : 0;
            if (currIndentLevel > lastIndentLevel) {
                this.indentStack.push(currIndentLevel);
                var indentToken = new this.Indent(image, offset, line, column);
                matchedTokens.push(indentToken);
            } else if (currIndentLevel < lastIndentLevel) {
                while (this.indentStack.length > 1 && currIndentLevel < _.last(this.indentStack)) {
                    this.indentStack.pop();
                    var dedentToken = new this.Dedent(image, offset, line, column);
                    matchedTokens.push(dedentToken);
                }
            }
        }
    }]);

    function ArgdownLexer() {
        _classCallCheck(this, ArgdownLexer);

        var $ = this;
        function matchRelation(text, matchedTokens, groups, pattern) {
            var startsWithNewline = /^(?:\n\r|\n|\r)/.exec(text) != null;
            if (_.isEmpty(matchedTokens) || startsWithNewline) {
                var match = pattern.exec(text);
                if (match !== null && match.length == 3) {
                    var indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }
        //relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)
        var matchIncomingSupport = _.partialRight(matchRelation, /^(?:\n\r|\n|\r)?([' '\t]*)(\+>)/);
        var matchIncomingAttack = _.partialRight(matchRelation, /^(?:\n\r|\n|\r)?([' '\t]*)(->)/);
        var matchOutgoingSupport = _.partialRight(matchRelation, /^(?:\n\r|\n|\r)?([' '\t]*)(<?\+)/);
        var matchOutgoingAttack = _.partialRight(matchRelation, /^(?:\n\r|\n|\r)?([' '\t]*)(<?-)/);

        $.IncomingSupport = createToken({
            name: "IncomingSupport",
            pattern: matchIncomingSupport
        });

        $.IncomingAttack = createToken({
            name: "IncomingAttack",
            pattern: matchIncomingAttack
        });

        $.OutgoingSupport = createToken({
            name: "OutgoingSupport",
            pattern: matchOutgoingSupport
        });

        $.OutgoingAttack = createToken({
            name: "OutgoingAttack",
            pattern: matchOutgoingAttack
        });

        var inferenceStartPattern = /^[\n\r|\n|\r]?[' '\t]*-{2}/;

        function matchInferenceStart(text, matchedTokens) {
            var startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
            if (_.isEmpty(matchedTokens) || startsWithNewline) {
                return inferenceStartPattern.exec(text);
            }
            return null;
        }
        $.InferenceStart = createToken({
            name: "InferenceStart",
            pattern: matchInferenceStart,
            push_mode: "inference_mode"
        });

        $.Colon = createToken({
            name: "Colon",
            pattern: /:/
        });
        $.ListDelimiter = createToken({
            name: "ListDelimiter",
            pattern: /,/
        });
        $.MetadataStatementEnd = createToken({
            name: "MetadataStatementEnd",
            pattern: /;/
        });
        $.MetadataStart = createToken({
            name: "MetadataStart",
            pattern: /\(/
        });
        $.MetadataEnd = createToken({
            name: "MetadataEnd",
            pattern: /\)/
        });

        $.InferenceEnd = createToken({
            name: "InferenceEnd",
            pattern: /-{2,}/,
            pop_mode: true
        });

        function matchListItem(text, matchedTokens, groups, pattern) {
            var startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
            var afterEmptyline = _.last(matchedTokens) instanceof $.Emptyline;
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                var match = pattern.exec(text);
                if (match !== null) {
                    var indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }

        var orderedListItemPattern = /^(?:\n\r|\n|\r)?([' '\t]+)\d+\.(?=\s)/;
        var matchOrderedListItem = _.partialRight(matchListItem, orderedListItemPattern);

        $.OrderedListItem = createToken({
            name: "OrderedListItem",
            pattern: matchOrderedListItem
        });
        //whitespace + * + whitespace (to distinguish list items from bold and italic ranges)
        var unorderedListItemPattern = /^(?:\n\r|\n|\r)?([' '\t]+)\*(?=\s)/; //Newline +
        var matchUnorderedListItem = _.partialRight(matchListItem, unorderedListItemPattern);

        $.UnorderedListItem = createToken({
            name: "UnorderedListItem",
            pattern: matchUnorderedListItem
        });

        var argumentStatementStartPattern = /^(?:\n\r|\n|\r)?[' '\t]*\(\d+\)/;

        function matchArgumentStatementStart(text, matchedTokens) {
            var startsWithNewline = /^(?:\n\r|\n|\r)/.exec(text) != null;
            var afterEmptyline = _.last(matchedTokens) instanceof $.Emptyline;
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                var match = argumentStatementStartPattern.exec(text);
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

        var emptylinePattern = /^((?:\n\r|\n|\r){2,})/; //two or more linebreaks
        function matchEmptyline(text, matchedTokens) {
            var last = _.last(matchedTokens);
            //ignore Emptylines after first one (relevant for Emptylines after ignored comments)
            if (last instanceof $.Emptyline) return null;
            var match = emptylinePattern.exec(text);
            if (match !== null) {
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

        //Indent and Dedent are never matched with their own patterns, instead they get matched in the relations custom patterns
        $.Indent = createToken({
            name: "Indent",
            pattern: chevrotain.Lexer.NA
        });
        $.Dedent = createToken({
            name: "Dedent",
            pattern: chevrotain.Lexer.NA
        });

        $.StatementDefinition = createToken({
            name: "StatementDefinition",
            pattern: /\[.+?\]\:/
        });

        $.StatementReference = createToken({
            name: "StatementReference",
            pattern: /\[.+?\]/
        });
        $.StatementMention = createToken({
            name: "StatementMention",
            pattern: /\@\[.+?\][ \t]?/
        });

        $.ArgumentDefinition = createToken({
            name: "ArgumentDefinition",
            pattern: /\<.+?\>\:/
        });

        $.ArgumentReference = createToken({
            name: "ArgumentReference",
            pattern: /\<.+?\>/
        });

        $.ArgumentMention = createToken({
            name: "ArgumentMention",
            pattern: /\@\<.+?\>[ \t]?/
        });

        var headingPattern = /^(#+)/;

        function matchHeadingStart(text, matchedTokens) {
            var afterEmptyline = _.last(matchedTokens) instanceof $.Emptyline;

            if (_.isEmpty(matchedTokens) || afterEmptyline) {
                return headingPattern.exec(text);
            }
            return null;
        }

        $.HeadingStart = createToken({
            name: "HeadingStart",
            pattern: matchHeadingStart
        });

        //BOLD and ITALIC ranges
        function matchBoldOrItalicStart(text, matchedTokens, groups, pattern, rangeType) {
            var match = pattern.exec(text);
            if (match != null) {
                $.rangesStack.push(rangeType);
            }
            return match;
        }

        function matchBoldOrItalicEnd(text, matchedTokens, groups, pattern, rangeType) {
            var lastRange = _.last($.rangesStack);
            if (lastRange != rangeType) return null;
            //first check if the last match was skipped Whitespace
            var skipped = groups[chevrotain.Lexer.SKIPPED];
            var lastSkipped = _.last(skipped);
            var lastMatched = _.last(matchedTokens);
            if (!lastMatched || lastSkipped && chevrotain.getEndOffset(lastSkipped) > chevrotain.getEndOffset(lastMatched)) {
                return null;
            }
            var match = pattern.exec(text);

            if (match != null) {
                $.rangesStack.pop();
            }

            return match;
        }
        var matchAsteriskBoldStart = _.partialRight(matchBoldOrItalicStart, /^\*\*(?!\s)/, "AsteriskBold");
        var matchAsteriskBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^\*\*(?:[ \t]|(?=\n|\r|\_|\.|,|!|\?|;|\*|$))/, "AsteriskBold");

        var matchUnderscoreBoldStart = _.partialRight(matchBoldOrItalicStart, /^__(?!\s)/, "UnderscoreBold");
        var matchUnderscoreBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^__(?:[ \t]|(?=\n|\r|\_|\.|,|!|\?|;|\*|$))/, "UnderscoreBold");

        var matchAsteriskItalicStart = _.partialRight(matchBoldOrItalicStart, /^\*(?!\s)/, "AsteriskItalic");
        var matchAsteriskItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\*(?:[ \t]|(?=\n|\r|\_|\.|,|!|\?|;|\*|$))/, "AsteriskItalic");

        var matchUnderscoreItalicStart = _.partialRight(matchBoldOrItalicStart, /^\_(?!\s)/, "UnderscoreItalic");
        var matchUnderscoreItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\_(?:[ \t]|(?=\n|\r|\_|\.|,|!|\?|;|\*|$))/, "UnderscoreItalic");

        $.AsteriskBoldStart = createToken({
            name: "AsteriskBoldStart",
            pattern: matchAsteriskBoldStart
        });

        $.AsteriskBoldEnd = createToken({
            name: "AsteriskBoldEnd",
            pattern: matchAsteriskBoldEnd
        });
        $.UnderscoreBoldStart = createToken({
            name: "UnderscoreBoldStart",
            pattern: matchUnderscoreBoldStart
        });

        $.UnderscoreBoldEnd = createToken({
            name: "UnderscoreBoldEnd",
            pattern: matchUnderscoreBoldEnd
        });

        $.AsteriskItalicStart = createToken({
            name: "AsteriskItalicStart",
            pattern: matchAsteriskItalicStart
        });

        $.AsteriskItalicEnd = createToken({
            name: "AsteriskItalicEnd",
            pattern: matchAsteriskItalicEnd
        });

        $.UnderscoreItalicStart = createToken({
            name: "UnderscoreItalicStart",
            pattern: matchUnderscoreItalicStart
        });

        $.UnderscoreItalicEnd = createToken({
            name: "UnderscoreItalicEnd",
            pattern: matchUnderscoreItalicEnd
        });

        $.Comment = createToken({
            name: "Comment",
            pattern: /<!--(?:.|\n|\r)*?-->/,
            group: chevrotain.Lexer.SKIPPED
        });

        $.Link = createToken({
            name: "Link",
            pattern: /\[[^\]]+?\]\([^\)]+?\)[ \t]?/
        });

        $.Newline = createToken({
            name: "Newline",
            pattern: /(?:\n\r|\n|\r)/,
            group: chevrotain.Lexer.SKIPPED
        });

        $.Spaces = createToken({
            name: "Spaces",
            pattern: /( |\t)+/,
            group: chevrotain.Lexer.SKIPPED
        });

        //The rest of the text that is free of any Argdown syntax
        $.Freestyle = createToken({
            name: "Freestyle",
            pattern: /[^\@\*\_\[\]\,\:\;\<\/\>\-\n\r\(\)]+/
        });

        //Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
        //Otherwise, every line would simply be lexed as a single Freestyle token.
        //If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
        //Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.
        $.UnusedControlChar = createToken({
            name: "UnusedControlChar",
            pattern: /[\@\*\_\[\]\,\:\;\<\/\>\-\(\)][ \t]?/
        });

        $.tokens = [$.Comment, $.Emptyline, $.Dedent, $.Indent, $.InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
        $.InferenceEnd, $.MetadataStatementEnd, $.MetadataStart, $.MetadataEnd, $.ListDelimiter, $.Colon, $.IncomingSupport, $.IncomingAttack, $.OutgoingSupport, $.OutgoingAttack, $.HeadingStart, $.ArgumentStatementStart, $.OrderedListItem, $.UnorderedListItem,
        //The ends of Bold and italic ranges need to be lexed before the starts
        $.AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
        $.UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
        $.AsteriskItalicEnd, $.UnderscoreItalicEnd,
        //The starts of Bold and italic ranges need to be lexed after the ends
        $.AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
        $.UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
        $.AsteriskItalicStart, $.UnderscoreItalicStart, $.Link, //needs to be lexed before StatementReference
        $.StatementMention, $.StatementDefinition, $.StatementReference, $.ArgumentMention, $.ArgumentDefinition, $.ArgumentReference, $.Newline, $.Spaces, $.Freestyle, $.UnusedControlChar];

        var lexerConfig = {

            modes: {
                "default_mode": [$.Comment, $.Emptyline,
                // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
                // Dedent must appear before Indent for handling zero spaces dedents.
                $.Dedent, $.Indent, $.InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
                $.IncomingSupport, $.IncomingAttack, $.OutgoingSupport, $.OutgoingAttack, $.HeadingStart, $.ArgumentStatementStart, $.OrderedListItem, $.UnorderedListItem,
                //The ends of Bold and italic ranges need to be lexed before the starts
                $.AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
                $.UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
                $.AsteriskItalicEnd, $.UnderscoreItalicEnd,
                //The starts of Bold and italic ranges need to be lexed after the ends
                $.AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
                $.UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
                $.AsteriskItalicStart, $.UnderscoreItalicStart, $.Link, //needs to be lexed before StatementReference
                $.StatementDefinition, $.StatementReference, $.StatementMention, $.ArgumentDefinition, $.ArgumentReference, $.ArgumentMention, $.Newline, $.Spaces, $.Freestyle, $.UnusedControlChar],
                "inference_mode": [$.Comment, $.InferenceEnd, $.MetadataStart, $.MetadataEnd, $.MetadataStatementEnd, $.ListDelimiter, $.Colon, $.Newline, $.Spaces, $.Freestyle, $.UnusedControlChar]
            },

            defaultMode: "default_mode"
        };

        this._lexer = new chevrotain.Lexer(lexerConfig);
    }

    _createClass(ArgdownLexer, [{
        key: 'logTokens',
        value: function logTokens(tokens) {
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var token = _step.value;

                    console.log(token.constructor.name + " " + token.image);
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
        }
    }, {
        key: 'tokenize',
        value: function tokenize(text) {
            this.init();

            var lexResult = this._lexer.tokenize(text);

            this.emitRemainingDedentTokens(lexResult.tokens);

            if (lexResult.errors.length > 0) {
                throw new Error("sad sad panda lexing errors detected");
            }
            return lexResult;
        }
    }]);

    return ArgdownLexer;
}();

module.exports = {
    ArgdownLexer: new ArgdownLexer()
};
//# sourceMappingURL=ArgdownLexer.js.map