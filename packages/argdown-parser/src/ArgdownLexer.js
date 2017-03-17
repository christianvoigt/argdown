'use strict';

import * as chevrotain from 'chevrotain';
import * as _ from 'lodash';

const createToken = chevrotain.createToken;
const Lexer = chevrotain.Lexer;

// State required for matching the indentations
let indentStack = [0];
// State require for matching bold and italic ranges in the right order
let rangesStack = [];

function getCurrentLine(matchedTokens){
  const matchedTokensIsEmpty = _.isEmpty(matchedTokens);
  if(matchedTokensIsEmpty)
    return 0;

  let last = _.last(matchedTokens);
  let currentLine = chevrotain.getEndLine(last);
  if(chevrotain.tokenMatcher(last, Emptyline))
    currentLine++;
  return currentLine;
}
function emitRemainingDedentTokens(matchedTokens){
  if(indentStack.length <= 1)
    return;
  const lastToken = _.last(matchedTokens.tokens);
  const lastOffset = (lastToken)? chevrotain.getEndOffset(lastToken) : 0;
  const lastLine = (lastToken)? chevrotain.getEndLine(lastToken) : 0;
  const lastColumn = (lastToken)? chevrotain.getEndColumn(lastToken) : 0;

  //add remaining Dedents
  while (indentStack.length > 1) {
      matchedTokens.push(new Dedent("", lastOffset, lastLine, lastColumn));
      indentStack.pop();
  }
}

function emitIndentOrDedent(matchedTokens, groups, indentStr){
  const currIndentLevel = indentStr.length;
  const lastIndentLevel = _.last(indentStack);
  const image = "";
  const last = _.last(matchedTokens);
  const offset = (last)? chevrotain.getEndOffset(last) + 1 : 0;
  const line = getCurrentLine(matchedTokens, groups.nl);
  const column = (last)? chevrotain.getEndColumn(last) + 1 : 0;
  if(currIndentLevel > lastIndentLevel){
    indentStack.push(currIndentLevel);
    let indentToken = new Indent(image, offset, line, column);
    matchedTokens.push(indentToken);
  }else if(currIndentLevel < lastIndentLevel){
    while(indentStack.length > 1 && currIndentLevel < _.last(indentStack)){
      indentStack.pop();
      let dedentToken = new Dedent(image, offset, line, column);
      matchedTokens.push(dedentToken);
    }
  }
}

function matchRelation(text, matchedTokens, groups, pattern){
  let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
  if (_.isEmpty(matchedTokens) || startsWithNewline) {
    let match = pattern.exec(text);
    if(match !== null && match.length == 3){
      let indentStr = match[1];
      emitIndentOrDedent(matchedTokens, groups, indentStr);
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

let IncomingSupport = createToken({
    name: "IncomingSupport",
    pattern: matchIncomingSupport
});

let IncomingAttack = createToken({
    name: "IncomingAttack",
    pattern: matchIncomingAttack
});

let OutgoingSupport = createToken({
    name: "OutgoingSupport",
    pattern: matchOutgoingSupport
});

let OutgoingAttack = createToken({
    name: "OutgoingAttack",
    pattern: matchOutgoingAttack
});

const inferenceStartPattern = /^[\n\r|\n|\r]?[' '\t]*-{2}/;
function matchInferenceStart(text, matchedTokens){
  let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
  if (_.isEmpty(matchedTokens) || startsWithNewline) {
    return inferenceStartPattern.exec(text);
  }
  return null;
}
let InferenceStart = createToken({
  name: "InferenceStart",
  pattern: matchInferenceStart,
  push_mode: "inference_mode"
});

let Colon = createToken({
  name: "Colon",
  pattern: /:/
});
let ListDelimiter = createToken({
  name: "ListDelimiter",
  pattern: /,/
});
let MetadataStatementEnd = createToken({
  name: "MetadataStatementEnd",
  pattern: /;/
});
let MetadataStart = createToken({
  name: "MetadataStart",
  pattern: /\(/
});
let MetadataEnd = createToken({
  name: "MetadataEnd",
  pattern: /\)/
});

let InferenceEnd = createToken({
  name: "InferenceEnd",
  pattern: /-{2,}/,
  pop_mode: true
});

function matchListItem(text, matchedTokens, groups, pattern){
  let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
  let afterEmptyline = _.last(matchedTokens) instanceof Emptyline;
  if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
    let match = pattern.exec(text);
    if(match !== null){
      let indentStr = match[1];
      emitIndentOrDedent(matchedTokens, groups, indentStr);
      return match;
    }
  }
  return null;
}

const orderedListItemPattern = /^[\n\r|\n|\r]?([' '\t]+)\d+\.(?=\s)/;
let matchOrderedListItem = _.partialRight(matchListItem, orderedListItemPattern);

let OrderedListItem = createToken({
  name: "OrderedListItem",
  pattern: matchOrderedListItem
});
//whitespace + * + whitespace (to distinguish list items from bold and italic ranges)
const unorderedListItemPattern = /^[\n\r|\n|\r]?([' '\t]+)\*(?=\s)/; //Newline +
let matchUnorderedListItem = _.partialRight(matchListItem, unorderedListItemPattern);

let UnorderedListItem = createToken({
  name: "UnorderedListItem",
  pattern: matchUnorderedListItem
});

const argumentStatementStartPattern = /^[\n\r|\n|\r]?[' '\t]*\(\d+\)/;
function matchArgumentStatementStart(text, matchedTokens){
  let startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
  let afterEmptyline = _.last(matchedTokens) instanceof Emptyline;
  if (_.isEmpty(matchedTokens) || afterEmptyline || startsWithNewline) {
    return argumentStatementStartPattern.exec(text);
  }
  return null;
}

let ArgumentStatementStart = createToken({
  name: "ArgumentStatementStart",
  pattern: matchArgumentStatementStart
});


const emptylinePattern = /^([\n\r|\n|\r]{2,})/; //two or more linebreaks
function emptylineMatching(text, matchedTokens){
  let last = _.last(matchedTokens);
  //ignore Emptylines after first one (relevant for Emptylines after ignored comments)
  if(last instanceof Emptyline)
    return null;
  let match = emptylinePattern.exec(text);
  if(match !== null){
    emitRemainingDedentTokens(matchedTokens);
    //TODO: emitRemainingRanges (to be more resistant against unclosed bold and italic ranges)
    return match;
  }
  return null;
}
let Emptyline = createToken({
    name: "Emptyline",
    pattern: emptylineMatching
});

//Indent and Dedent are never matched with their own patterns, instead they get matched in the relations custom patterns
let Indent = createToken({
    name: "Indent",
    pattern: Lexer.NA
});
let Dedent = createToken({
    name: "Dedent",
    pattern: Lexer.NA
});

let StatementDefinition = createToken({
  name: "StatementDefinition",
  pattern: /\[.+\]\:/
});

let StatementReference = createToken({
  name: "StatementReference",
  pattern: /\[.+\]/
});

let ArgumentDefinition = createToken({
  name: "ArgumentDefinition",
  pattern: /\<.+\>\:/
});

let ArgumentReference = createToken({
  name: "ArgumentReference",
  pattern: /\<.+\>/
});

const headingPattern = /^(#+)/;
function matchHeadingStart(text, matchedTokens){
  let afterEmptyline = _.last(matchedTokens) instanceof Emptyline;

  if (_.isEmpty(matchedTokens) || afterEmptyline) {
    return headingPattern.exec(text);
  }
  return null;

}

let HeadingStart = createToken({
  name: "HeadingStart",
  pattern: matchHeadingStart
});

//BOLD and ITALIC ranges
function matchBoldOrItalicStart(text, matchedTokens, groups, pattern, rangeType){
  let match = pattern.exec(text);
  if(match != null){
    rangesStack.push(rangeType);
  }
  return match;
}
function matchBoldOrItalicEnd(text, matchedTokens, groups, pattern, rangeType){
  let lastRange = _.last(rangesStack);
  if(lastRange != rangeType)
    return null;
  //first check if the last match was skipped Whitespace
  let skipped = groups[Lexer.SKIPPED];
  let lastSkipped = _.last(skipped);
  let lastMatched = _.last(matchedTokens);
  if(!lastMatched
    || (lastSkipped && chevrotain.getEndOffset(lastSkipped) > chevrotain.getEndOffset(lastMatched))){
    return null;
  }
  let match = pattern.exec(text);
  if(match != null){
    rangesStack.pop();
  }

  return match;
}
let matchStarBoldStart = _.partialRight(matchBoldOrItalicStart, /^\*\*(?!\s)/, "StarBold");
let matchStarBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^\*\*(?=\s|_|\.|,|!|\?|;|\*|$)/, "StarBold");

let matchUnderscoreBoldStart = _.partialRight(matchBoldOrItalicStart, /^__(?!\s)/, "UnderscoreBold");
let matchUnderscoreBoldEnd = _.partialRight(matchBoldOrItalicEnd, /^__(?=\s|_|\.|,|!|\?|;|\*|$)/, "UnderscoreBold");

let matchStarItalicStart = _.partialRight(matchBoldOrItalicStart, /^\*(?!\s)/, "StarItalic");
let matchStarItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\*(?=\s|_|\.|,|!|\?|;|\*|$)/, "StarItalic");

let matchUnderscoreItalicStart = _.partialRight(matchBoldOrItalicStart, /^\_(?!\s)/, "UnderscoreItalic");
let matchUnderscoreItalicEnd = _.partialRight(matchBoldOrItalicEnd, /^\_(?=\s|_|\.|,|!|\?|;|\*|$)/, "UnderscoreItalic");


let StarBoldStart = createToken({
  name: "StarBoldStart",
  pattern: matchStarBoldStart
});

let StarBoldEnd = createToken({
  name: "StarBoldEnd",
  pattern: matchStarBoldEnd
});
let UnderscoreBoldStart = createToken({
  name: "UnderscoreBoldStart",
  pattern: matchUnderscoreBoldStart
});

let UnderscoreBoldEnd = createToken({
  name: "UnderscoreBoldEnd",
  pattern: matchUnderscoreBoldEnd
});

let StarItalicStart = createToken({
  name: "StarItalicStart",
  pattern: matchStarItalicStart
});

let StarItalicEnd = createToken({
  name: "StarItalicEnd",
  pattern: matchStarItalicEnd
});

let UnderscoreItalicStart = createToken({
  name: "UnderscoreItalicStart",
  pattern: matchUnderscoreItalicStart
});

let UnderscoreItalicEnd = createToken({
  name: "UnderscoreItalicEnd",
  pattern: matchUnderscoreItalicEnd
});

let Comment = createToken({
  name: "Comment",
  pattern: /<!--(?:.|\n|\r)*?-->/,
  group: Lexer.SKIPPED
});

let Link = createToken({
  name: "Link",
  pattern: /\[[^\]]+\]\([^\)]+\)/
});

let Newline = createToken({
    name: "Newline",
    pattern: /(\n|\r)/,
    group: Lexer.SKIPPED
});

let Spaces = createToken({
    name: "Spaces",
    pattern: /( |\t)+/,
    group: Lexer.SKIPPED
});

//The rest of the text that is free of any Argdown syntax
let Freestyle = createToken({
  name: "Freestyle",
  pattern: /[^\*\_\[\]\,\:\;\<\/\>\-\n\r\(\)]+/
});

//Freestyle text needs to be "cut up" by these control characters so that the other rules get a chance to succeed.
//Otherwise, every line would simply be lexed as a single Freestyle token.
//If these chars are not consumed by other rules, they are lexed as "useless" UnusedControlChars. The parser then has to combine Freestyle and UnusedControlChar tokens back together to get "normal text" token sequences.
//Note that some "meaningful" characters (like +) are not listed here, as they are only meaningful after a linebreak and freestyle text already gets "cut up" by each line break.
let UnusedControlChar = createToken({
  name: "UnusedControlChar",
  pattern: /[\*\_\[\]\,\:\;\<\/\>\-\(\)]/
});

let allTokens = [
  Comment,
  Emptyline,
  Dedent,
  Indent,
  InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
  InferenceEnd,
  MetadataStatementEnd,
  MetadataStart,
  MetadataEnd,
  ListDelimiter,
  Colon,
  IncomingSupport,
  IncomingAttack,
  OutgoingSupport,
  OutgoingAttack,
  HeadingStart,
  ArgumentStatementStart,
  OrderedListItem,
  UnorderedListItem,
  //The ends of Bold and italic ranges need to be lexed before the starts
  StarBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
  UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
  StarItalicEnd,
  UnderscoreItalicEnd,
  //The starts of Bold and italic ranges need to be lexed after the ends
  StarBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
  UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
  StarItalicStart,
  UnderscoreItalicStart,
  Link, //needs to be lexed before StatementReference
  StatementDefinition,
  StatementReference,
  ArgumentDefinition,
  ArgumentReference,
  Newline,
  Spaces,
  Freestyle,
  UnusedControlChar
];

let lexerConfig = {

    modes: {
        "default_mode": [
          Comment,
          Emptyline,
          // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
          // Dedent must appear before Indent for handling zero spaces dedents.
          Dedent,
          Indent,
          InferenceStart, //needs to be lexed before OutgoingAttack (- vs --)
          IncomingSupport,
          IncomingAttack,
          OutgoingSupport,
          OutgoingAttack,
          HeadingStart,
          ArgumentStatementStart,
          OrderedListItem,
          UnorderedListItem,
          //The ends of Bold and italic ranges need to be lexed before the starts
          StarBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (** vs *)
          UnderscoreBoldEnd, //BoldEnd needs to be lexed before ItalicEnd (__ vs _)
          StarItalicEnd,
          UnderscoreItalicEnd,
          //The starts of Bold and italic ranges need to be lexed after the ends
          StarBoldStart, //BoldStart needs to be lexed before ItalicStart (** vs *)
          UnderscoreBoldStart, //BoldStart needs to be lexed before ItalicStart (__ vs _)
          StarItalicStart,
          UnderscoreItalicStart,
          Link, //needs to be lexed before StatementReference
          StatementDefinition,
          StatementReference,
          ArgumentDefinition,
          ArgumentReference,
          Newline,
          Spaces,
          Freestyle,
          UnusedControlChar
        ],
        "inference_mode":  [
          Comment,
          InferenceEnd,
          MetadataStart,
          MetadataEnd,
          MetadataStatementEnd,
          ListDelimiter,
          Colon,
          Newline,
          Spaces,
          Freestyle,
          UnusedControlChar
        ]
    },

    defaultMode: "default_mode"
};
let customPatternLexer = new Lexer(lexerConfig);

module.exports = {

    // for testing purposes
    Link: Link,
    Comment: Comment,
    Emptyline: Emptyline,
    Indent: Indent,
    Dedent: Dedent,
    HeadingStart: HeadingStart,
    ArgumentStatementStart: ArgumentStatementStart,
    OrderedListItem: OrderedListItem,
    UnorderedListItem: UnorderedListItem,
    IncomingSupport: IncomingSupport,
    IncomingAttack: IncomingAttack,
    OutgoingSupport: OutgoingSupport,
    OutgoingAttack: OutgoingAttack,
    StatementReference: StatementReference,
    StatementDefinition: StatementDefinition,
    ArgumentReference: ArgumentReference,
    ArgumentDefinition: ArgumentDefinition,
    Freestyle: Freestyle,
    Spaces: Spaces,
    InferenceStart: InferenceStart,
    InferenceEnd: InferenceEnd,
    Colon: Colon,
    ListDelimiter: ListDelimiter,
    MetadataStart: MetadataStart,
    MetadataEnd: MetadataEnd,
    MetadataStatementEnd: MetadataStatementEnd,
    UnusedControlChar: UnusedControlChar,
    StarBoldStart: StarBoldStart,
    StarBoldEnd: StarBoldEnd,
    StarItalicStart: StarItalicStart,
    StarItalicEnd: StarItalicEnd,
    UnderscoreBoldStart: UnderscoreBoldStart,
    UnderscoreBoldEnd: UnderscoreBoldEnd,
    UnderscoreItalicStart: UnderscoreItalicStart,
    UnderscoreItalicEnd: UnderscoreItalicEnd,

    logTokens: function(lexResult){
      for(let token of lexResult.tokens){
        console.log(token.constructor.name+" "+token.image);
      }
    },

    tokens: allTokens,

    tokenize: function(text) {

        // have to reset the indent stack between processing of different text inputs
        indentStack = [0];

        let lexResult = customPatternLexer.tokenize(text);

        emitRemainingDedentTokens(lexResult.tokens);

        if (lexResult.errors.length > 0) {
            throw new Error("sad sad panda lexing errors detected");
        }
        return lexResult;
    }
};
