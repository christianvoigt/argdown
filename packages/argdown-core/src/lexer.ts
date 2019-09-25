"use strict";

import * as chevrotain from "chevrotain";
import last from "lodash.last";
import partialRight from "lodash.partialright";
import { TokenNames } from "./TokenNames";
import { arrayIsEmpty, objectIsEmpty } from "./utils";

const createToken = chevrotain.createToken;
const createTokenInstance = chevrotain.createTokenInstance;
const tokenMatcher = chevrotain.tokenMatcher;

// State required for matching the indentations
let indentStack: number[] = [];
// State required for matching bold and italic ranges in the right order
let rangesStack: string[] = [];
export const tokenList: chevrotain.TokenType[] = [];
export const NEWLINE_GROUP: string = "NL_GROUP";

const init = () => {
    indentStack = [0];
    rangesStack = [];
};
const getCurrentLine = (tokens: chevrotain.IToken[], groups: any): number => {
    const nlGroup = groups[NEWLINE_GROUP];
    const matchedTokensIsEmpty = arrayIsEmpty(tokens);
    const nlGroupIsEmpty = objectIsEmpty(nlGroup);
    if (matchedTokensIsEmpty && nlGroupIsEmpty) return 1;

    const lastToken = last(tokens);
    const lastNl: any = last(nlGroup);
    let currentLine = lastToken ? lastToken.endLine! : 1;
    if (lastToken && chevrotain.tokenMatcher(lastToken, Emptyline)) {
        currentLine++;
    }
    if (lastNl && lastNl.endLine! + 1 > currentLine) {
        currentLine = lastNl.endLine! + 1;
    }
    return currentLine;
};
const getCurrentEndOffset = (
    tokens: chevrotain.IToken[],
    groups: any
): number => {
    const nlGroup = groups[NEWLINE_GROUP];
    const matchedTokensIsEmpty = arrayIsEmpty(tokens);
    const nlGroupIsEmpty = objectIsEmpty(nlGroup);
    if (matchedTokensIsEmpty && nlGroupIsEmpty) return 0;

    const lastToken = last(tokens);
    const lastNl: any = last(nlGroup);
    const tokenEndOffset = lastToken ? lastToken.endOffset! : 0;
    const nlEndOffset = lastNl ? lastNl.endOffset! : 0;
    return tokenEndOffset > nlEndOffset ? tokenEndOffset : nlEndOffset;
};
const lastTokenIsNewline = (
    lastToken: chevrotain.IToken | undefined,
    groups: any
): boolean => {
    const newlineGroup = groups[NEWLINE_GROUP];
    const lastNl: any = last(newlineGroup);
    return lastNl && (!lastToken || lastNl.endOffset! > lastToken.endOffset!);
};

const emitRemainingDedentTokens = (
    matchedTokens: chevrotain.IToken[],
    groups: { [groupName: string]: chevrotain.IToken[] }
): void => {
    if (indentStack.length <= 1) {
        return;
    }
    const lastToken = last(matchedTokens);
    const startOffset = getCurrentEndOffset(matchedTokens, groups);
    const endOffset = startOffset;
    const startLine = getCurrentLine(matchedTokens, groups);
    const endLine = startLine;
    const startColumn =
        lastToken && lastToken.endColumn ? lastToken.endColumn : 0;
    const endColumn = startColumn;

    //add remaining Dedents
    while (indentStack.length > 1) {
        matchedTokens.push(
            createTokenInstance(
                Dedent,
                "",
                startOffset,
                endOffset,
                startLine,
                endLine,
                startColumn,
                endColumn
            )
        );
        indentStack.pop();
    }
};

const emitIndentOrDedent = (
    matchedTokens: chevrotain.IToken[],
    groups: { [groupName: string]: chevrotain.IToken[] },
    indentStr: string
): void => {
    const currIndentLevel = indentStr.length;
    let lastIndentLevel = last(indentStack) || 0;
    const image = "";
    const startOffset = getCurrentEndOffset(matchedTokens, groups) + 1;
    const endOffset = startOffset + indentStr.length - 1;
    const startLine = getCurrentLine(matchedTokens, groups);
    const endLine = startLine;
    const startColumn = 1;
    const endColumn = startColumn + indentStr.length - 1;
    if (currIndentLevel > lastIndentLevel) {
        indentStack.push(currIndentLevel);
        let indentToken = createTokenInstance(
            Indent,
            image,
            startOffset,
            endOffset,
            startLine,
            endLine,
            startColumn,
            endColumn
        );
        matchedTokens.push(indentToken);
    } else if (currIndentLevel < lastIndentLevel) {
        while (indentStack.length > 1 && currIndentLevel < lastIndentLevel) {
            indentStack.pop();
            lastIndentLevel = last(indentStack) || 0;
            let dedentToken = createTokenInstance(
                Dedent,
                image,
                startOffset,
                endOffset,
                startLine,
                endLine,
                startColumn,
                endColumn
            );
            matchedTokens.push(dedentToken);
        }
    }
};
const matchRelation = (
    text: string,
    offset?: number,
    tokens?: chevrotain.IToken[],
    groups?: object,
    pattern?: RegExp
) => {
    const remainingText = text.substr(offset || 0);
    const lastToken = last(tokens);
    const afterNewline = lastTokenIsNewline(lastToken, groups!);
    const afterEmptyline = lastToken && tokenMatcher(lastToken, Emptyline);

    if (arrayIsEmpty(tokens) || afterEmptyline || afterNewline) {
        //relations after Emptyline are illegal, but we need the token for error reporting
        let match = pattern!.exec(remainingText);
        if (match !== null && match.length == 3) {
            const indentStr = match[1];
            emitIndentOrDedent(tokens!, <any>groups!, indentStr);
            return match;
        }
    }
    return null;
};
//relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)
const matchIncomingSupport = partialRight(matchRelation, /^([' '\t]*)(\+>)/);
const matchIncomingAttack = partialRight(matchRelation, /^([' '\t]*)(->)/);
const matchOutgoingSupport = partialRight(matchRelation, /^([' '\t]*)(<?\+)/);
const matchOutgoingAttack = partialRight(matchRelation, /^([' '\t]*)(<?-)/);
const matchContradiction = partialRight(matchRelation, /^([' '\t]*)(><)/);
const matchIncomingUndercut = partialRight(matchRelation, /^([' '\t]*)(_>)/);
const matchOutgoingUndercut = partialRight(
    matchRelation,
    /^([' '\t]*)(<_|(?:_(?=\s)))/
);

export const IncomingSupport = createToken({
    name: TokenNames.INCOMING_SUPPORT,
    pattern: matchIncomingSupport,
    line_breaks: true,
    label: "+> (Incoming Support)",
    start_chars_hint: [" ", "\t", "+"]
});
tokenList.push(IncomingSupport);

export const IncomingAttack = createToken({
    name: TokenNames.INCOMING_ATTACK,
    pattern: matchIncomingAttack,
    line_breaks: true,
    label: "-> (Incoming Attack)",
    start_chars_hint: [" ", "\t", "-"]
});
tokenList.push(IncomingAttack);

export const OutgoingSupport = createToken({
    name: TokenNames.OUTGOING_SUPPORT,
    pattern: matchOutgoingSupport,
    line_breaks: true,
    label: "<+ (Outgoing Support)",
    start_chars_hint: [" ", "\t", "<"]
});
tokenList.push(OutgoingSupport);

export const OutgoingAttack = createToken({
    name: TokenNames.OUTGOING_ATTACK,
    pattern: matchOutgoingAttack,
    line_breaks: true,
    label: "<- (Outgoing Attack)",
    start_chars_hint: [" ", "\t", "<"]
});
tokenList.push(OutgoingAttack);

export const Contradiction = createToken({
    name: TokenNames.CONTRADICTION,
    pattern: matchContradiction,
    line_breaks: true,
    label: ">< (Contradiction)",
    start_chars_hint: [" ", "\t", ">"]
});
tokenList.push(Contradiction);
export const IncomingUndercut = createToken({
    name: TokenNames.INCOMING_UNDERCUT,
    pattern: matchIncomingUndercut,
    line_breaks: true,
    label: "_> (Incoming Undercut)",
    start_chars_hint: [" ", "\t", "_"]
});
tokenList.push(IncomingUndercut);
export const OutgoingUndercut = createToken({
    name: TokenNames.OUTGOING_UNDERCUT,
    pattern: matchOutgoingUndercut,
    line_breaks: true,
    label: "<_ (Outgoing Undercut)",
    start_chars_hint: [" ", "\t", "<"]
});
tokenList.push(OutgoingUndercut);

const inferenceStartPattern = /^[' '\t]*-{2}/;

const matchInferenceStart: chevrotain.CustomPatternMatcherFunc = (
    text,
    offset,
    tokens,
    groups
) => {
    let remainingText = text.substr(offset || 0);
    const lastToken = last(tokens);
    let afterNewline = lastTokenIsNewline(lastToken, groups!);
    if (arrayIsEmpty(tokens) || afterNewline) {
        const match = inferenceStartPattern.exec(remainingText);
        if (match != null) {
            emitRemainingDedentTokens(tokens!, <any>groups!);
            return match;
        }
    }
    return null;
};

export const InferenceStart = createToken({
    name: TokenNames.INFERENCE_START,
    pattern: matchInferenceStart,
    push_mode: "inference_mode",
    line_breaks: true,
    label: "-- (Inference Start)",
    start_chars_hint: [" ", "\t", "-"]
});
tokenList.push(InferenceStart);

export const FrontMatter = createToken({
    name: TokenNames.FRONT_MATTER,
    pattern: /===+[^=]*===+/,
    label: "Front Matter (YAML)"
});
tokenList.push(FrontMatter);

export const Data = createToken({
    name: TokenNames.DATA,
    pattern: /{((?!}\s[^\,}])(.|\n))*}(?!\s*(\,|}))/,
    label: "Meta Data (YAML)"
});
tokenList.push(Data);
export const ListDelimiter = createToken({
    name: TokenNames.LIST_DELIMITER,
    pattern: /,/,
    label: ","
});
tokenList.push(ListDelimiter);

export const InferenceEnd = createToken({
    name: TokenNames.INFERENCE_END,
    pattern: /-{2,}/,
    pop_mode: true,
    label: "-- (Inference End)"
});
tokenList.push(InferenceEnd);

const matchListItem = (
    text: string,
    offset?: number,
    tokens?: chevrotain.IToken[],
    groups?: { [groupName: string]: chevrotain.IToken[] },
    pattern?: RegExp
): RegExpExecArray | null => {
    let remainingText = text.substr(offset || 0);
    let lastToken = last(tokens);
    let afterNewline = lastTokenIsNewline(lastToken, groups!);
    let afterEmptyline = lastToken && tokenMatcher(lastToken, Emptyline);
    if (arrayIsEmpty(tokens) || afterEmptyline || afterNewline) {
        let match = pattern!.exec(remainingText);
        if (match !== null) {
            /*
       dirty hack: 
       we add an empty space, because emitIndentOrDedent only indents if indentStr.length > 0
       for lists, starting with no whitespace is allowed, so we have to fake it
       (the method was written for relations, which need to start with whitespace)
       */
            const indentStr = match[1] + " ";
            emitIndentOrDedent(tokens!, groups!, indentStr);
            return match;
        }
    }
    return null;
};

const orderedListItemPattern = /^([' '\t]*)\d+\.(?=\s)/;
const matchOrderedListItem = partialRight(
    matchListItem,
    orderedListItemPattern
);

export const OrderedListItem = createToken({
    name: TokenNames.ORDERED_LIST_ITEM,
    pattern: matchOrderedListItem,
    line_breaks: true,
    label: "{Indentation}{number}. (Ordered List Item)",
    start_chars_hint: [" ", "\t"]
});
tokenList.push(OrderedListItem);
//whitespace + * + whitespace (to distinguish list items from bold and italic ranges)
const unorderedListItemPattern = /^([' '\t]*)\*(?=\s)/;
const matchUnorderedListItem = partialRight(
    matchListItem,
    unorderedListItemPattern
);

export const UnorderedListItem = createToken({
    name: TokenNames.UNORDERED_LIST_ITEM,
    pattern: matchUnorderedListItem,
    line_breaks: true,
    label: "{Indentation}* (Unordered List Item)",
    start_chars_hint: [" ", "\t"]
});
tokenList.push(UnorderedListItem);

//This does not work with \r\n|\n||r as a simple CRLF linebreak will be interpreted as an Emptyline
//Instead we drop the last alternative (\r?\n would work as well)
const emptylinePattern = /^((?:\r\n|\n)[ \t]*(?:\r\n|\n)+)/; //two or more linebreaks
const matchEmptyline = (
    text: string,
    offset?: number,
    tokens?: chevrotain.IToken[],
    groups?: object
) => {
    let remainingText = text.substr(offset || 0);
    let lastToken = last(tokens);
    //ignore Emptylines after first one (relevant for Emptylines after ignored comments)
    if (lastToken && tokenMatcher(lastToken, Emptyline)) return null;
    let match = emptylinePattern.exec(remainingText);
    if (match !== null && match[0].length < remainingText.length) {
        //ignore trailing linebreaks
        emitRemainingDedentTokens(tokens!, <any>groups!);
        //TODO: emitRemainingRanges (to be more resistant against unclosed bold and italic ranges)
        return match;
    }
    return null;
};
export const Emptyline = createToken({
    name: TokenNames.EMPTYLINE,
    pattern: matchEmptyline,
    line_breaks: true,
    label: "{linebreak}{linebreak} (Empty Line)",
    start_chars_hint: ["\r", "\n"]
});
tokenList.push(Emptyline);

//Indent and Dedent are never matched with their own patterns, instead they get matched in the relations custom patterns
export const Indent = createToken({
    name: TokenNames.INDENT,
    pattern: chevrotain.Lexer.NA
});
tokenList.push(Indent);

export const Dedent = createToken({
    name: TokenNames.DEDENT,
    pattern: chevrotain.Lexer.NA
});
tokenList.push(Dedent);

export const StatementDefinition = createToken({
    name: TokenNames.STATEMENT_DEFINITION,
    pattern: /\[.+?\]\:/,
    label: "[Statement Title]: (Statement Definition)"
});
tokenList.push(StatementDefinition);

// $.StatementDefinitionByNumber = createToken({
//     name: "StatementDefinitionByNumber",
//     pattern: /\<(.+?)\>\((\d+)\)\:/
// });
// $.tokens.push($.StatementDefinitionByNumber);

export const StatementReference = createToken({
    name: TokenNames.STATEMENT_REFERENCE,
    pattern: /\[.+?\]/,
    label: "[Statement Title] (Statement Reference)"
});
tokenList.push(StatementReference);

// $.StatementReferenceByNumber = createToken({
//     name: "StatementReferenceByNumber",
//     pattern: /\<(.+?)\>\(\d+\)/
// });
// $.tokens.push($.StatementReferenceByNumber);

export const StatementMention = createToken({
    name: TokenNames.STATEMENT_MENTION,
    pattern: /\@\[.+?\][ \t]?/,
    label: "@[Statement Title] (Statement Mention)"
});
tokenList.push(StatementMention);

// $.StatementMentionByNumber = createToken({
//     name: "StatementMentionByNumber",
//     pattern: /\@\<(.+?)\>\(\d+\)/
// });
// $.tokens.push($.StatementMentionByNumber);

const statementNumberPattern = /^[' '\t]*\(\d+\)/;
const matchStatementNumber = (
    text: string,
    offset?: number,
    tokens?: chevrotain.IToken[],
    groups?: object
) => {
    let remainingText = text.substr(offset || 0);
    var lastToken = last(tokens);
    let afterNewline = lastTokenIsNewline(lastToken, groups!);
    let afterEmptyline = lastToken && tokenMatcher(lastToken, Emptyline);

    //Statement in argument reconstruction:
    if (arrayIsEmpty(tokens) || afterEmptyline || afterNewline) {
        let match = statementNumberPattern.exec(remainingText);
        if (match !== null) {
            emitRemainingDedentTokens(tokens!, <any>groups!);
            return match;
        }
    }
    return null;
};
export const StatementNumber = createToken({
    name: TokenNames.STATEMENT_NUMBER,
    pattern: matchStatementNumber,
    line_breaks: true,
    label: "(Number) (Statement Number)",
    start_chars_hint: [" ", "\t", "("]
});
tokenList.push(StatementNumber);

export const ArgumentDefinition = createToken({
    name: TokenNames.ARGUMENT_DEFINITION,
    pattern: /\<.+?\>\:/,
    label: "<Argument Title>: (Argument Definition)"
});
tokenList.push(ArgumentDefinition);

export const ArgumentReference = createToken({
    name: TokenNames.ARGUMENT_REFERENCE,
    pattern: /\<.+?\>/,
    label: "<Argument Title> (Argument Reference)"
});
tokenList.push(ArgumentReference);

export const ArgumentMention = createToken({
    name: TokenNames.ARGUMENT_MENTION,
    pattern: /\@\<.+?\>[ \t]?/,
    label: "@<Argument Title> (Argument Mention)"
});
tokenList.push(ArgumentMention);

const headingPattern = /^(#+)(?: )/;
const matchHeadingStart = (
    text: string,
    offset?: number,
    tokens?: chevrotain.IToken[]
) => {
    let remainingText = text.substr(offset || 0);
    let lastToken = last(tokens);
    let afterEmptyline = lastToken && tokenMatcher(lastToken, Emptyline);

    if (!lastToken || afterEmptyline) {
        const match = headingPattern.exec(remainingText);
        if (match) {
            return match;
        }
    }
    return null;
};
export const HeadingStart = createToken({
    name: TokenNames.HEADING_START,
    pattern: matchHeadingStart,
    label: "# (Heading Start)",
    line_breaks: false,
    start_chars_hint: ["#"]
});
tokenList.push(HeadingStart);

//BOLD and ITALIC ranges
const matchBoldOrItalicStart = (
    text: string,
    offset?: number,
    _tokens?: chevrotain.IToken[],
    _groups?: any,
    pattern?: RegExp,
    rangeType?: string
) => {
    let remainingText = text.substr(offset || 0);
    let match = pattern!.exec(remainingText);
    if (match != null) {
        rangesStack.push(rangeType!);
        return match;
    }
    return null;
};

const matchBoldOrItalicEnd = (
    text: string,
    offset?: number,
    tokens?: chevrotain.IToken[],
    groups?: any,
    pattern?: RegExp,
    rangeType?: string
): RegExpExecArray | null => {
    let lastRange = last(rangesStack);
    if (lastRange != rangeType) return null;
    //first check if the last match was skipped Whitespace
    let skipped: any = groups ? groups[chevrotain.Lexer.SKIPPED] : null;
    let lastSkipped: any = last(skipped);
    let lastMatched = last(tokens);
    if (
        !lastMatched ||
        (lastSkipped && lastSkipped.endOffset! > lastMatched.endOffset!)
    ) {
        return null;
    }
    let remainingText = text.substr(offset || 0);
    let match = pattern!.exec(remainingText);

    if (match != null) {
        rangesStack.pop();
        return match;
    }
    return null;
};
const matchAsteriskBoldStart = partialRight(
    matchBoldOrItalicStart,
    /^\*\*(?!\s)/,
    "AsteriskBold"
);
const matchAsteriskBoldEnd = partialRight(
    matchBoldOrItalicEnd,
    /^\*\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/,
    "AsteriskBold"
);

const matchUnderscoreBoldStart = partialRight(
    matchBoldOrItalicStart,
    /^__(?!\s)/,
    "UnderscoreBold"
);
const matchUnderscoreBoldEnd = partialRight(
    matchBoldOrItalicEnd,
    /^__(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/,
    "UnderscoreBold"
);

const matchAsteriskItalicStart = partialRight(
    matchBoldOrItalicStart,
    /^\*(?!\s)/,
    "AsteriskItalic"
);
const matchAsteriskItalicEnd = partialRight(
    matchBoldOrItalicEnd,
    /^\*(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/,
    "AsteriskItalic"
);

const matchUnderscoreItalicStart = partialRight(
    matchBoldOrItalicStart,
    /^\_(?!\s)/,
    "UnderscoreItalic"
);
const matchUnderscoreItalicEnd = partialRight(
    matchBoldOrItalicEnd,
    /^\_(?:[ \t]|(?=\n|\r|\)|\}|\_|\.|,|!|\?|;|:|-|\*|$))/,
    "UnderscoreItalic"
);

export const AsteriskBoldStart = createToken({
    name: TokenNames.ASTERISK_BOLD_START,
    pattern: matchAsteriskBoldStart,
    label: "** (Bold Start)",
    line_breaks: false,
    start_chars_hint: ["*"]
});
tokenList.push(AsteriskBoldStart);

export const AsteriskBoldEnd = createToken({
    name: TokenNames.ASTERISK_BOLD_END,
    pattern: matchAsteriskBoldEnd,
    label: "** (Bold End)",
    line_breaks: false,
    start_chars_hint: ["*"]
});
tokenList.push(AsteriskBoldEnd);

export const UnderscoreBoldStart = createToken({
    name: TokenNames.UNDERSCORE_BOLD_START,
    pattern: matchUnderscoreBoldStart,
    label: "__ (Bold Start)",
    line_breaks: false,
    start_chars_hint: ["_"]
});
tokenList.push(UnderscoreBoldStart);

export const UnderscoreBoldEnd = createToken({
    name: TokenNames.UNDERSCORE_BOLD_END,
    pattern: matchUnderscoreBoldEnd,
    label: "__ (Bold End)",
    line_breaks: false,
    start_chars_hint: ["_"]
});
tokenList.push(UnderscoreBoldEnd);

export const AsteriskItalicStart = createToken({
    name: TokenNames.ASTERISK_ITALIC_START,
    pattern: matchAsteriskItalicStart,
    label: "* (Italic Start)",
    line_breaks: false,
    start_chars_hint: ["*"]
});
tokenList.push(AsteriskItalicStart);

export const AsteriskItalicEnd = createToken({
    name: TokenNames.ASTERISK_ITALIC_END,
    pattern: matchAsteriskItalicEnd,
    label: "* (Italic End)",
    line_breaks: false,
    start_chars_hint: ["*"]
});
tokenList.push(AsteriskItalicEnd);

export const UnderscoreItalicStart = createToken({
    name: TokenNames.UNDERSCORE_ITALIC_START,
    pattern: matchUnderscoreItalicStart,
    label: "_ (Italic Start)",
    line_breaks: false,
    start_chars_hint: ["_"]
});
tokenList.push(UnderscoreItalicStart);

export const UnderscoreItalicEnd = createToken({
    name: TokenNames.UNDERSCORE_ITALIC_END,
    pattern: matchUnderscoreItalicEnd,
    label: "_ (Italic End)",
    line_breaks: false,
    start_chars_hint: ["_"]
});
tokenList.push(UnderscoreItalicEnd);

export const Comment = createToken({
    name: TokenNames.COMMENT,
    pattern: /(?:<!--(?:.|\n|\r)*?-->)|(?:\/\*(?:.|\n|\r)*?\*\/)|(?:\/\/.*?(?=\r\n|\n|\r))/,
    group: chevrotain.Lexer.SKIPPED,
    line_breaks: true,
    label: "// or /**/ or <!-- --> (Comment)"
});
tokenList.push(Comment);

export const Link = createToken({
    name: TokenNames.LINK,
    pattern: /\[[^\]]+?\]\([^\)]+?\)[ \t]?/,
    label: "[Title](Url) (Link)"
});
tokenList.push(Link);

export const Tag = createToken({
    name: TokenNames.TAG,
    pattern: /#(?:\([^\)]+\)|[a-zA-z0-9-\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)[ \t]?/,
    label: "#tag-text or #(tag text) (Tag)"
});
tokenList.push(Tag);

export const Newline = createToken({
    name: TokenNames.NEWLINE,
    pattern: /(?:\r\n|\n|\r)/,
    group: "NL_GROUP",
    line_breaks: true,
    label: "{linebreak} (New Line)"
});
tokenList.push(Newline);

export const Spaces = createToken({
    name: TokenNames.SPACES,
    pattern: /( |\t)+/,
    group: chevrotain.Lexer.SKIPPED
});
tokenList.push(Spaces);

export const EscapedChar = createToken({
    name: TokenNames.ESCAPED_CHAR,
    pattern: /\\.(?: )*/,
    label: "\\{character} (Escaped Character)"
});
tokenList.push(EscapedChar);

//The rest of the text that is free of any Argdown syntax
export const Freestyle = createToken({
    name: TokenNames.FREESTYLE,
    pattern: /[^\\\@\#\*\_\[\]\,\:\;\<\/\>\-\r\n\(\)\{\}]+/,
    line_breaks: true,
    label: "Text Content"
});
tokenList.push(Freestyle);

//Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
//Otherwise, every line would simply be lexed as a single Freestyle token.
//If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
//Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.
export const UnusedControlChar = createToken({
    name: TokenNames.UNUSED_CONTROL_CHAR,
    pattern: /[\@\#\*\_\[\]\,\:\;\<\/\>\-\(\)\{\}][ \t]?/,
    label: "Text Content (Special Characters)"
});
tokenList.push(UnusedControlChar);

export const EOF = chevrotain.EOF;

const lexerConfig: chevrotain.IMultiModeLexerDefinition = {
    modes: {
        default_mode: [
            Comment,
            FrontMatter,
            Data,
            EscapedChar, //must come first after $.Comment
            Emptyline,
            Newline,
            // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
            // Dedent must appear before Indent for handling zero spaces dedents.
            Dedent,
            Indent,
            InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
            IncomingSupport,
            IncomingAttack,
            OutgoingSupport,
            OutgoingAttack,
            Contradiction,
            IncomingUndercut,
            OutgoingUndercut,
            HeadingStart,
            //$.ArgumentStatementStart,
            StatementNumber,
            OrderedListItem,
            UnorderedListItem,
            //The ends of Bold and italic ranges need to be lexed before the starts
            AsteriskBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
            UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
            AsteriskItalicEnd,
            UnderscoreItalicEnd,
            //The starts of Bold and italic ranges need to be lexed after the ends
            AsteriskBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
            UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
            AsteriskItalicStart,
            UnderscoreItalicStart,
            Link, //needs to be lexed before StatementReference
            Tag,
            // $.StatementDefinitionByNumber, // needs to be lexed before ArgumentReference
            // $.StatementReferenceByNumber, // needs to be lexed before ArgumentReference
            // $.StatementMentionByNumber, // needs to be lexed before ArgumentReference
            StatementDefinition,
            StatementReference,
            StatementMention,
            ArgumentDefinition,
            ArgumentReference,
            ArgumentMention,
            Spaces,
            Freestyle,
            UnusedControlChar
        ],
        inference_mode: [
            Newline,
            Comment,
            InferenceEnd,
            Data,
            ListDelimiter,
            Spaces,
            Freestyle,
            UnusedControlChar
        ]
    },

    defaultMode: "default_mode"
};

const lexer = new chevrotain.Lexer(lexerConfig);
export const tokenize = (text: string): chevrotain.ILexingResult => {
    init();

    let lexResult = lexer.tokenize(text);
    if (lexResult.errors && lexResult.errors.length > 0) {
        throw new Error("sad sad panda lexing errors detected");
    }

    //remove trailing Emptyline (parser cannot cope with it)
    const lastToken = last(lexResult.tokens);
    if (lastToken && tokenMatcher(lastToken, Emptyline)) {
        lexResult.tokens.pop();
    }

    emitRemainingDedentTokens(lexResult.tokens, lexResult.groups);

    return lexResult;
};
