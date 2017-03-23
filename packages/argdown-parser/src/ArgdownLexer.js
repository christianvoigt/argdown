'use strict';

import * as chevrotain from 'chevrotain';
import * as _ from 'lodash';

const createToken = chevrotain.createToken;

class ArgdownLexer {
    init() {
        // State required for matching the indentations
        this.indentStack = [0];
        // State require for matching bold and italic ranges in the right order
        this.rangesStack = [];
    }
    getCurrentLine(matchedTokens) {
        const matchedTokensIsEmpty = _.isEmpty(matchedTokens);
        if (matchedTokensIsEmpty)
            return 0;

        let last = _.last(matchedTokens);
        let currentLine = chevrotain.getEndLine(last);
        if (chevrotain.tokenMatcher(last, this.Emptyline))
            currentLine++;
        return currentLine;
    }

    emitRemainingDedentTokens(matchedTokens) {
        if (this.indentStack.length <= 1)
            return;
        const lastToken = _.last(matchedTokens.tokens);
        const lastOffset = (lastToken) ? chevrotain.getEndOffset(lastToken) : 0;
        const lastLine = (lastToken) ? chevrotain.getEndLine(lastToken) : 0;
        const lastColumn = (lastToken) ? chevrotain.getEndColumn(lastToken) : 0;

        //add remaining Dedents
        while (this.indentStack.length > 1) {
            matchedTokens.push(new this.Dedent("", lastOffset, lastLine, lastColumn));
            this.indentStack.pop();
        }
    }

    emitIndentOrDedent(matchedTokens, groups, indentStr) {
        const currIndentLevel = indentStr.length;
        const lastIndentLevel = _.last(this.indentStack);
        const image = "";
        const last = _.last(matchedTokens);
        const offset = (last) ? chevrotain.getEndOffset(last) + 1 : 0;
        const line = this.getCurrentLine(matchedTokens, groups.nl);
        const column = (last) ? chevrotain.getEndColumn(last) + 1 : 0;
        if (currIndentLevel > lastIndentLevel) {
            this.indentStack.push(currIndentLevel);
            let indentToken = new this.Indent(image, offset, line, column);
            matchedTokens.push(indentToken);
        } else if (currIndentLevel < lastIndentLevel) {
            while (this.indentStack.length > 1 && currIndentLevel < _.last(this.indentStack)) {
                this.indentStack.pop();
                let dedentToken = new this.Dedent(image, offset, line, column);
                matchedTokens.push(dedentToken);
            }
        }
    }

    constructor() {
        let $ = this;
        function matchRelation(text, matchedTokens, groups, pattern) {
            let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
            if (_.isEmpty(matchedTokens) || startsWithNewline) {
                let match = pattern.exec(text);
                if (match !== null && match.length == 3) {
                    let indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }
        //relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)
        let matchIncomingSupport = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(\+>)/);
        let matchIncomingAttack = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(->)/);
        let matchOutgoingSupport = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(<?\+)/);
        let matchOutgoingAttack = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(<?-)/);

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

        const inferenceStartPattern = /^[\n\r|\n|\r]?[' '\t]*-{2}/;

        function matchInferenceStart(text, matchedTokens) {
            let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
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
            let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
            let afterEmptyline = _.last(matchedTokens) instanceof $.Emptyline;
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                let match = pattern.exec(text);
                if (match !== null) {
                    let indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }

        const orderedListItemPattern = /^[\n\r|\n|\r]?([' '\t]+)\d+\.(?=\s)/;
        let matchOrderedListItem = _.partialRight(matchListItem, orderedListItemPattern);

        $.OrderedListItem = createToken({
            name: "OrderedListItem",
            pattern: matchOrderedListItem
        });
        //whitespace + * + whitespace (to distinguish list items from bold and italic ranges)
        const unorderedListItemPattern = /^[\n\r|\n|\r]?([' '\t]+)\*(?=\s)/; //Newline +
        let matchUnorderedListItem = _.partialRight(matchListItem, unorderedListItemPattern);

        $.UnorderedListItem = createToken({
            name: "UnorderedListItem",
            pattern: matchUnorderedListItem
        });

        const argumentStatementStartPattern = /^[\n\r|\n|\r]?[' '\t]*\(\d+\)/;

        function matchArgumentStatementStart(text, matchedTokens) {
            let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
            let afterEmptyline = _.last(matchedTokens) instanceof $.Emptyline;
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                let match = argumentStatementStartPattern.exec(text);
                if(match){
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


        const emptylinePattern = /^([\n\r|\n|\r]{2,})/; //two or more linebreaks
        function emptylineMatching(text, matchedTokens) {
            let last = _.last(matchedTokens);
            //ignore Emptylines after first one (relevant for Emptylines after ignored comments)
            if (last instanceof $.Emptyline)
                return null;
            let match = emptylinePattern.exec(text);
            if (match !== null) {
                $.emitRemainingDedentTokens(matchedTokens);
                //TODO: emitRemainingRanges (to be more resistant against unclosed bold and italic ranges)
                return match;
            }
            return null;
        }
        $.Emptyline = createToken({
            name: "Emptyline",
            pattern: emptylineMatching
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
            pattern: /\[.+\]\:/
        });

        $.StatementReference = createToken({
            name: "StatementReference",
            pattern: /\[.+\]/
        });

        $.ArgumentDefinition = createToken({
            name: "ArgumentDefinition",
            pattern: /\<.+\>\:/
        });

        $.ArgumentReference = createToken({
            name: "ArgumentReference",
            pattern: /\<.+\>/
        });

        const headingPattern = /^(#+)/;

        function matchHeadingStart(text, matchedTokens) {
            let afterEmptyline = _.last(matchedTokens) instanceof $.Emptyline;

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
            let match = pattern.exec(text);
            if (match != null) {
                $.rangesStack.push(rangeType);
            }
            return match;
        }

        function matchBoldOrItalicEnd(text, matchedTokens, groups, pattern, rangeType) {
            let lastRange = _.last($.rangesStack);
            if (lastRange != rangeType)
                return null;
            //first check if the last match was skipped Whitespace
            let skipped = groups[chevrotain.Lexer.SKIPPED];
            let lastSkipped = _.last(skipped);
            let lastMatched = _.last(matchedTokens);
            if (!lastMatched ||
                (lastSkipped && chevrotain.getEndOffset(lastSkipped) > chevrotain.getEndOffset(lastMatched))) {
                return null;
            }
            let match = pattern.exec(text);
            if (match != null) {
                $.rangesStack.pop();
            }

            return match;
        }
        let matchAsteriskBoldStart = _.partialRight(matchBoldOrItalicStart, /^\*\*(?!\s)/, "AsteriskBold");
        let matchAsteriskBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^\*\*(?=\s|_|\.|,|!|\?|;|\*|$)/, "AsteriskBold");

        let matchUnderscoreBoldStart = _.partialRight(matchBoldOrItalicStart, /^__(?!\s)/, "UnderscoreBold");
        let matchUnderscoreBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^__(?=\s|_|\.|,|!|\?|;|\*|$)/, "UnderscoreBold");

        let matchAsteriskItalicStart = _.partialRight(matchBoldOrItalicStart, /^\*(?!\s)/, "AsteriskItalic");
        let matchAsteriskItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\*(?=\s|_|\.|,|!|\?|;|\*|$)/, "AsteriskItalic");

        let matchUnderscoreItalicStart = _.partialRight(matchBoldOrItalicStart, /^\_(?!\s)/, "UnderscoreItalic");
        let matchUnderscoreItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\_(?=\s|_|\.|,|!|\?|;|\*|$)/, "UnderscoreItalic");


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
            pattern: /\[[^\]]+\]\([^\)]+\)/
        });

        $.Newline = createToken({
            name: "Newline",
            pattern: /(\n|\r)/,
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
            pattern: /[^\*\_\[\]\,\:\;\<\/\>\-\n\r\(\)]+/
        });

        //Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
        //Otherwise, every line would simply be lexed as a single Freestyle token.
        //If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
        //Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.
        $.UnusedControlChar = createToken({
            name: "UnusedControlChar",
            pattern: /[\*\_\[\]\,\:\;\<\/\>\-\(\)]/
        });

        $.tokens = [
            $.Comment,
            $.Emptyline,
            $.Dedent,
            $.Indent,
            $.InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
            $.InferenceEnd,
            $.MetadataStatementEnd,
            $.MetadataStart,
            $.MetadataEnd,
            $.ListDelimiter,
            $.Colon,
            $.IncomingSupport,
            $.IncomingAttack,
            $.OutgoingSupport,
            $.OutgoingAttack,
            $.HeadingStart,
            $.ArgumentStatementStart,
            $.OrderedListItem,
            $.UnorderedListItem,
            //The ends of Bold and italic ranges need to be lexed before the starts
            $.AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
            $.UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
            $.AsteriskItalicEnd,
            $.UnderscoreItalicEnd,
            //The starts of Bold and italic ranges need to be lexed after the ends
            $.AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
            $.UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
            $.AsteriskItalicStart,
            $.UnderscoreItalicStart,
            $.Link, //needs to be lexed before StatementReference
            $.StatementDefinition,
            $.StatementReference,
            $.ArgumentDefinition,
            $.ArgumentReference,
            $.Newline,
            $.Spaces,
            $.Freestyle,
            $.UnusedControlChar
        ];

        let lexerConfig = {

            modes: {
                "default_mode": [
                    $.Comment,
                    $.Emptyline,
                    // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
                    // Dedent must appear before Indent for handling zero spaces dedents.
                    $.Dedent,
                    $.Indent,
                    $.InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
                    $.IncomingSupport,
                    $.IncomingAttack,
                    $.OutgoingSupport,
                    $.OutgoingAttack,
                    $.HeadingStart,
                    $.ArgumentStatementStart,
                    $.OrderedListItem,
                    $.UnorderedListItem,
                    //The ends of Bold and italic ranges need to be lexed before the starts
                    $.AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
                    $.UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
                    $.AsteriskItalicEnd,
                    $.UnderscoreItalicEnd,
                    //The starts of Bold and italic ranges need to be lexed after the ends
                    $.AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
                    $.UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
                    $.AsteriskItalicStart,
                    $.UnderscoreItalicStart,
                    $.Link, //needs to be lexed before StatementReference
                    $.StatementDefinition,
                    $.StatementReference,
                    $.ArgumentDefinition,
                    $.ArgumentReference,
                    $.Newline,
                    $.Spaces,
                    $.Freestyle,
                    $.UnusedControlChar
                ],
                "inference_mode": [
                    $.Comment,
                    $.InferenceEnd,
                    $.MetadataStart,
                    $.MetadataEnd,
                    $.MetadataStatementEnd,
                    $.ListDelimiter,
                    $.Colon,
                    $.Newline,
                    $.Spaces,
                    $.Freestyle,
                    $.UnusedControlChar
                ]
            },

            defaultMode: "default_mode"
        };

        this._lexer = new chevrotain.Lexer(lexerConfig);

    }

    logTokens(tokens) {
        for (let token of tokens) {
            console.log(token.constructor.name + " " + token.image);
        }
    }
    tokenize(text) {
        this.init();

        let lexResult = this._lexer.tokenize(text);

        this.emitRemainingDedentTokens(lexResult.tokens);

        if (lexResult.errors.length > 0) {
            throw new Error("sad sad panda lexing errors detected");
        }
        return lexResult;
    }

}

module.exports = {
    ArgdownLexer: new ArgdownLexer()
};
