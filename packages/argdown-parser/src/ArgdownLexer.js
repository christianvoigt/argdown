'use strict';

import * as chevrotain from 'chevrotain';
import * as _ from 'lodash';

const createToken = chevrotain.createToken;
const createTokenInstance = chevrotain.createTokenInstance;
const tokenMatcher = chevrotain.tokenMatcher;
const getTokenConstructor = chevrotain.getTokenConstructor;

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
        let currentLine = (last)? last.endLine : 0;
        if (last && chevrotain.tokenMatcher(last, this.Emptyline))
            currentLine++;
        return currentLine;
    }

    emitRemainingDedentTokens(matchedTokens) {
        if (this.indentStack.length <= 1)
            return;
        const lastToken = _.last(matchedTokens.tokens);
        const startOffset = (lastToken) ? lastToken.endOffset : 0;
        const endOffset = startOffset;
        const startLine = (lastToken) ? lastToken.endLine : 0;
        const endLine = startLine;
        const startColumn = (lastToken) ? lastToken.endColumn : 0;
        const endColumn = startColumn;

        //add remaining Dedents
        while (this.indentStack.length > 1) {
            matchedTokens.push(createTokenInstance(this.Dedent, "", startOffset, endOffset, startLine, endLine, startColumn, endColumn));
            this.indentStack.pop();
        }
    }

    emitIndentOrDedent(matchedTokens, groups, indentStr) {
        const currIndentLevel = indentStr.length;
        const lastIndentLevel = _.last(this.indentStack);
        const image = "";
        const last = _.last(matchedTokens);
        const startOffset = (last) ? last.endOffset + 1 : 0;
        const endOffset = startOffset;
        const startLine = this.getCurrentLine(matchedTokens, groups.nl);
        const endLine = startLine;
        const startColumn = (last) ? last.endColumn + 1 : 0;
        const endColumn = startColumn;
        if (currIndentLevel > lastIndentLevel) {
            this.indentStack.push(currIndentLevel);
            let indentToken = createTokenInstance(this.Indent, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn);
            matchedTokens.push(indentToken);
        } else if (currIndentLevel < lastIndentLevel) {
            while (this.indentStack.length > 1 && currIndentLevel < _.last(this.indentStack)) {
                this.indentStack.pop();
                let dedentToken = createTokenInstance(this.Dedent, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn);
                matchedTokens.push(dedentToken);
            }
        }
    }

    constructor() {
        let $ = this;
        $.tokens = []; //token list for the parser

        function matchRelation(text, offset, matchedTokens, groups, pattern) {
            let remainingText = text.substr(offset);
            let startsWithNewline = /^(?:\r\n|\n|\r)/.exec(remainingText) != null;
            let last = _.last(matchedTokens);
            let afterEmptyline = last && tokenMatcher(last, $.Emptyline);
            
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) { //relations after Emptyline are illegal, but we need the token for error reporting
                let match = pattern.exec(remainingText);
                if (match !== null && match.length == 3) {
                    let indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }
        //relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)
        let matchIncomingSupport = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(\+>)/);
        let matchIncomingAttack = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(->)/);
        let matchOutgoingSupport = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(<?\+)/);
        let matchOutgoingAttack = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(<?-)/);
        let matchContradiction = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(><)/);
        let matchIncomingUndercut = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(_>)/);
        let matchOutgoingUndercut = _.partialRight(matchRelation, /^(?:\r\n|\n|\r)?([' '\t]*)(<_)/);

        $.IncomingSupport = createToken({
            name: "IncomingSupport",
            pattern: matchIncomingSupport,
            line_breaks: true,
            label: "+> (Incoming Support)"
        });
        $.tokens.push($.IncomingSupport);

        $.IncomingAttack = createToken({
            name: "IncomingAttack",
            pattern: matchIncomingAttack,
            line_breaks: true,
            label: "-> (Incoming Attack)"
        });
        $.tokens.push($.IncomingAttack);

        $.OutgoingSupport = createToken({
            name: "OutgoingSupport",
            pattern: matchOutgoingSupport,
            line_breaks: true,
            label: "<+ (Outgoing Support)"
        });
        $.tokens.push($.OutgoingSupport);

        $.OutgoingAttack = createToken({
            name: "OutgoingAttack",
            pattern: matchOutgoingAttack,
            line_breaks: true,
            label: "<- (Outgoing Attack)"
        });
        $.tokens.push($.OutgoingAttack);

        $.Contradiction = createToken({
            name: "Contradiction",
            pattern: matchContradiction,
            line_breaks: true,
            label: ">< (Contradiction)"
        });
        $.tokens.push($.Contradiction);
        $.IncomingUndercut = createToken({
            name: "IncomingUndercut",
            pattern: matchIncomingUndercut,
            line_breaks: true,
            label: "_> (Incoming Undercut)"
        });
        $.tokens.push($.IncomingUndercut);
        $.OutgoingUndercut = createToken({
            name: "OutgoingUndercut",
            pattern: matchOutgoingUndercut,
            line_breaks: true,
            label: "<_ (Outgoing Undercut)"
        });
        $.tokens.push($.OutgoingUndercut);

        const inferenceStartPattern = /^[\r\n|\n|\r]?[' '\t]*-{2}/;

        function matchInferenceStart(text, offset, matchedTokens) {
            let remainingText = text.substr(offset);
            let startsWithNewline = /^[\r\n|\n|\r]/.exec(remainingText) != null;
            if (_.isEmpty(matchedTokens) || startsWithNewline) {
                let match = inferenceStartPattern.exec(remainingText);
                if(match != null){
                  $.emitRemainingDedentTokens(matchedTokens);
                  return match;
                }
            }
            return null;
        }
        $.InferenceStart = createToken({
            name: "InferenceStart",
            pattern: matchInferenceStart,
            push_mode: "inference_mode",
            line_breaks: true,
            label: "-- (Inference Start)"            
        });
        $.tokens.push($.InferenceStart);

        $.Colon = createToken({
            name: "Colon",
            pattern: /:/,
            label: ":"
        });
        $.tokens.push($.Colon);
        $.ListDelimiter = createToken({
            name: "ListDelimiter",
            pattern: /,/,
            label: ","
        });
        $.tokens.push($.ListDelimiter);
        $.MetadataStatementEnd = createToken({
            name: "MetadataStatementEnd",
            pattern: /;/,
            label: ";"
        });
        $.tokens.push($.MetadataStatementEnd);
        $.MetadataStart = createToken({
            name: "MetadataStart",
            pattern: /\(/,
            label: "("
        });
        $.tokens.push($.MetadataStart);
        $.MetadataEnd = createToken({
            name: "MetadataEnd",
            pattern: /\)/,
            label: ")"
        });
        $.tokens.push($.MetadataEnd);

        $.InferenceEnd = createToken({
            name: "InferenceEnd",
            pattern: /-{2,}/,
            pop_mode: true,
            label: "-- (Inference End)"
        });
        $.tokens.push($.InferenceEnd);

        function matchListItem(text, offset, matchedTokens, groups, pattern) {
            let remainingText = text.substr(offset);
            let startsWithNewline = /^[\r\n|\n|\r]/.exec(remainingText) != null;
            let last = _.last(matchedTokens);
            let afterEmptyline = last && tokenMatcher(last, $.Emptyline);
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                let match = pattern.exec(remainingText);
                if (match !== null) {
                    let indentStr = match[1];
                    $.emitIndentOrDedent(matchedTokens, groups, indentStr);
                    return match;
                }
            }
            return null;
        }

        const orderedListItemPattern = /^(?:\r\n|\n|\r)?([' '\t]+)\d+\.(?=\s)/;
        let matchOrderedListItem = _.partialRight(matchListItem, orderedListItemPattern);

        $.OrderedListItem = createToken({
            name: "OrderedListItem",
            pattern: matchOrderedListItem,
            line_breaks: true,
            label: "{Indentation}{number}. (Ordered List Item)"         
        });
        $.tokens.push($.OrderedListItem);
        //whitespace + * + whitespace (to distinguish list items from bold and italic ranges)
        const unorderedListItemPattern = /^(?:\r\n|\n|\r)?([' '\t]+)\*(?=\s)/; //Newline +
        let matchUnorderedListItem = _.partialRight(matchListItem, unorderedListItemPattern);

        $.UnorderedListItem = createToken({
            name: "UnorderedListItem",
            pattern: matchUnorderedListItem,
            line_breaks: true,
            label: "{Indentation}* (Unordered List Item)"           
        });
        $.tokens.push($.UnorderedListItem);

        //This does not work with \r\n|\n||r as a simple CRLF linebreak will be interpreted as an Emptyline
        //Instead we drop the last alternative (\r?\n would work as well)
        const emptylinePattern = /^((?:\r\n|\n)[ \t]*(?:\r\n|\n)+)/; //two or more linebreaks
        function matchEmptyline(text, offset, matchedTokens) {
            let remainingText = text.substr(offset);
            let last = _.last(matchedTokens);
            //ignore Emptylines after first one (relevant for Emptylines after ignored comments)
            if (last && tokenMatcher(last, $.Emptyline))
                return null;
            let match = emptylinePattern.exec(remainingText);
            if (match !== null && match[0].length < remainingText.length) { //ignore trailing linebreaks
                $.emitRemainingDedentTokens(matchedTokens);
                //TODO: emitRemainingRanges (to be more resistant against unclosed bold and italic ranges)
                return match;
            }
            return null;
        }
        $.Emptyline = createToken({
            name: "Emptyline",
            pattern: matchEmptyline,
            line_breaks: true,
            label: "{linebreak}{linebreak} (Empty Line)"       
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
            pattern: /\[.+?\]\:/,
            label: "[Statement Title]: (Statement Definition)"
        });
        $.tokens.push($.StatementDefinition);

        // $.StatementDefinitionByNumber = createToken({
        //     name: "StatementDefinitionByNumber",
        //     pattern: /\<(.+?)\>\((\d+)\)\:/
        // });
        // $.tokens.push($.StatementDefinitionByNumber);

        $.StatementReference = createToken({
            name: "StatementReference",
            pattern: /\[.+?\]/,
            label: "[Statement Title] (Statement Reference)"
        });
        $.tokens.push($.StatementReference);

        // $.StatementReferenceByNumber = createToken({
        //     name: "StatementReferenceByNumber",
        //     pattern: /\<(.+?)\>\(\d+\)/
        // });
        // $.tokens.push($.StatementReferenceByNumber);


        $.StatementMention = createToken({
          name: "StatementMention",
          pattern: /\@\[.+?\][ \t]?/,
          label: "@[Statement Title] (Statement Mention)"
        });
        $.tokens.push($.StatementMention);

        // $.StatementMentionByNumber = createToken({
        //     name: "StatementMentionByNumber",
        //     pattern: /\@\<(.+?)\>\(\d+\)/
        // });
        // $.tokens.push($.StatementMentionByNumber);

        const statementNumberPattern = /^(?:\r\n|\n|\r)?[' '\t]*\(\d+\)/;
        function matchStatementNumber(text, offset, matchedTokens) {
            let remainingText = text.substr(offset);
            var last = _.last(matchedTokens);
            let startsWithNewline = /^(?:\r\n|\n|\r)/.exec(remainingText) != null;
            let afterEmptyline = last && tokenMatcher(last, $.Emptyline);

            //Statement in argument reconstruction:
            if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
                let match = statementNumberPattern.exec(remainingText);
                if (match !== null) {
                    $.emitRemainingDedentTokens(matchedTokens);
                    return match;
                }
            }
            return null;
        }
        $.StatementNumber = createToken({
            name: "StatementNumber",
            pattern: matchStatementNumber,
            line_breaks: true,
            label: "(Number) (Statement Number)"   
        });
        $.tokens.push($.StatementNumber);

        $.ArgumentDefinition = createToken({
            name: "ArgumentDefinition",
            pattern: /\<.+?\>\:/,
            label: "<Argument Title>: (Argument Definition)"
        });
        $.tokens.push($.ArgumentDefinition);

        $.ArgumentReference = createToken({
            name: "ArgumentReference",
            pattern: /\<.+?\>/,
            label: "<Argument Title> (Argument Reference)"
        });
        $.tokens.push($.ArgumentReference);

        $.ArgumentMention = createToken({
          name: "ArgumentMention",
          pattern: /\@\<.+?\>[ \t]?/,
          label: "@<Argument Title> (Argument Mention)"
        });
        $.tokens.push($.ArgumentMention);

        const headingPattern = /^(#+)/;
        function matchHeadingStart(text, offset, matchedTokens) {
            let remainingText = text.substr(offset);
            let last = _.last(matchedTokens);
            let afterEmptyline = last && tokenMatcher(last, $.Emptyline);

            if (!last || afterEmptyline) {
                return headingPattern.exec(remainingText);
            }
            return null;

        }
        $.HeadingStart = createToken({
            name: "HeadingStart",
            pattern: matchHeadingStart,
            label: "# (Heading Start)"
        });
        $.tokens.push($.HeadingStart);

        //BOLD and ITALIC ranges
        function matchBoldOrItalicStart(text, offset, matchedTokens, groups, pattern, rangeType) {
            let remainingText = text.substr(offset);
            let match = pattern.exec(remainingText);
            if (match != null) {
                $.rangesStack.push(rangeType);
            }
            return match;
        }

        function matchBoldOrItalicEnd(text, offset, matchedTokens, groups, pattern, rangeType) {
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
            let remainingText = text.substr(offset);
            let match = pattern.exec(remainingText);

            if (match != null) {
                $.rangesStack.pop();
            }

            return match;
        }
        let matchAsteriskBoldStart = _.partialRight(matchBoldOrItalicStart, /^\*\*(?!\s)/, "AsteriskBold");
        let matchAsteriskBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^\*\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "AsteriskBold");

        let matchUnderscoreBoldStart = _.partialRight(matchBoldOrItalicStart, /^__(?!\s)/, "UnderscoreBold");
        let matchUnderscoreBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^__(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "UnderscoreBold");

        let matchAsteriskItalicStart = _.partialRight(matchBoldOrItalicStart, /^\*(?!\s)/, "AsteriskItalic");
        let matchAsteriskItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "AsteriskItalic");

        let matchUnderscoreItalicStart = _.partialRight(matchBoldOrItalicStart, /^\_(?!\s)/, "UnderscoreItalic");
        let matchUnderscoreItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\_(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/, "UnderscoreItalic");


        $.AsteriskBoldStart = createToken({
            name: "AsteriskBoldStart",
            pattern: matchAsteriskBoldStart,
            label: "** (Bold Start)"
        });
        $.tokens.push($.AsteriskBoldStart);

        $.AsteriskBoldEnd = createToken({
            name: "AsteriskBoldEnd",
            pattern: matchAsteriskBoldEnd,
            label: "** (Bold End)"
        });
        $.tokens.push($.AsteriskBoldEnd);

        $.UnderscoreBoldStart = createToken({
            name: "UnderscoreBoldStart",
            pattern: matchUnderscoreBoldStart,
            label: "__ (Bold Start)"
        });
        $.tokens.push($.UnderscoreBoldStart);

        $.UnderscoreBoldEnd = createToken({
            name: "UnderscoreBoldEnd",
            pattern: matchUnderscoreBoldEnd,
            label: "__ (Bold End)"
        });
        $.tokens.push($.UnderscoreBoldEnd);

        $.AsteriskItalicStart = createToken({
            name: "AsteriskItalicStart",
            pattern: matchAsteriskItalicStart,
            label: "* (Italic Start)"
        });
        $.tokens.push($.AsteriskItalicStart);

        $.AsteriskItalicEnd = createToken({
            name: "AsteriskItalicEnd",
            pattern: matchAsteriskItalicEnd,
            label: "* (Italic End)"
        });
        $.tokens.push($.AsteriskItalicEnd);

        $.UnderscoreItalicStart = createToken({
            name: "UnderscoreItalicStart",
            pattern: matchUnderscoreItalicStart,
            label: "_ (Italic Start)"
        });
        $.tokens.push($.UnderscoreItalicStart);

        $.UnderscoreItalicEnd = createToken({
            name: "UnderscoreItalicEnd",
            pattern: matchUnderscoreItalicEnd,
            label: "_ (Italic End)"
        });
        $.tokens.push($.UnderscoreItalicEnd);

        $.Comment = createToken({
            name: "Comment",
            pattern: /(?:<!--(?:.|\n|\r)*?-->)|(?:\/\*(?:.|\n|\r)*?\*\/)|(?:\/\/.*?(?=\r\n|\n|\r))/,
            group: chevrotain.Lexer.SKIPPED,
            line_breaks: true,
            label: "// or /**/ or <!-- --> (Comment)"        
        });
        $.tokens.push($.Comment);

        $.Link = createToken({
            name: "Link",
            pattern: /\[[^\]]+?\]\([^\)]+?\)[ \t]?/,
            label: "[Title](Url) (Link)"
        });
        $.tokens.push($.Link);
        
        $.Tag = createToken({
          name: "Tag",
          pattern: /#(?:\([^\)]+\)|[a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)[ \t]?/,
          label: "#tag-text or #(tag text) (Tag)"
        });
        $.tokens.push($.Tag);

        $.Newline = createToken({
            name: "Newline",
            pattern: /(?:\r\n|\n|\r)/,
            group: chevrotain.Lexer.SKIPPED,
            line_breaks: true,
            label: "{linebreak} (New Line)"
        });
        $.tokens.push($.Newline);

        $.Spaces = createToken({
            name: "Spaces",
            pattern: /( |\t)+/,
            group: chevrotain.Lexer.SKIPPED
        });
        $.tokens.push($.Spaces);

        $.EscapedChar = createToken({
            name: "EscapedChar",
            pattern: /\\.(?: )*/,
            label: "\\{character} (Escaped Character)"
        });
        $.tokens.push($.EscapedChar);

        //The rest of the text that is free of any Argdown syntax
        $.Freestyle = createToken({
            name: "Freestyle",
            pattern: /[^\\\@\#\*\_\[\]\,\:\;\<\/\>\-\r\n\(\)]+/,
            line_breaks: true,
            label: "Text Content"
        });
        $.tokens.push($.Freestyle);

        //Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
        //Otherwise, every line would simply be lexed as a single Freestyle token.
        //If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
        //Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.
        $.UnusedControlChar = createToken({
            name: "UnusedControlChar",
            pattern: /[\@\#\*\_\[\]\,\:\;\<\/\>\-\(\)][ \t]?/,
            label: "Text Content (Special Characters)"
        });
        $.tokens.push($.UnusedControlChar);

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
                    $.Contradiction,
                    $.IncomingUndercut,
                    $.OutgoingUndercut,
                    $.HeadingStart,
                    //$.ArgumentStatementStart,
                    $.StatementNumber,
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
                    $.Tag,
                    // $.StatementDefinitionByNumber, // needs to be lexed before ArgumentReference
                    // $.StatementReferenceByNumber, // needs to be lexed before ArgumentReference
                    // $.StatementMentionByNumber, // needs to be lexed before ArgumentReference
                    $.StatementDefinition,
                    $.StatementReference,
                    $.StatementMention,
                    $.ArgumentDefinition,
                    $.ArgumentReference,
                    $.ArgumentMention,
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
    tokensToString(tokens) {
      let str = "";
      for (let token of tokens) {
          str += getTokenConstructor(token).tokenName + " " + token.image +"\n";
      }
      return str;
    }
    tokenize(text) {
        this.init();

        let lexResult = this._lexer.tokenize(text);
        if (lexResult.errors.length > 0) {
            throw new Error("sad sad panda lexing errors detected");
        }
        
        //remove trailing Emptyline (parser cannot cope with it)
        if(tokenMatcher(_.last(lexResult.tokens), this.Emptyline)){
          lexResult.tokens.pop();
        }

        this.emitRemainingDedentTokens(lexResult.tokens);

        return lexResult;
    }
}

module.exports = {
    ArgdownLexer: new ArgdownLexer()
};
