'use strict';

import * as chevrotain from 'chevrotain';
import * as _ from 'lodash';

const createToken = chevrotain.createToken;
const Lexer = chevrotain.Lexer;

// State required for matching the indentations
let indentStack = [0];

function getCurrentLine(matchedTokens){
  const matchedTokensIsEmpty = _.isEmpty(matchedTokens);
  if(matchedTokensIsEmpty)
    return 0;

  let last = _.last(matchedTokens);
  let currentLine = chevrotain.getEndLine(last);
  if(last instanceof Emptyline)
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

const emptylinePattern = /^([\n\r|\n|\r]{2,})[^\s\t]/; //two linebreaks, not followed by whitespace
function emptylineMatching(text, matchedTokens){
  let match = emptylinePattern.exec(text);
  if(match !== null && match.length == 2){
    emitRemainingDedentTokens(matchedTokens);
    match[0] = match[1];
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

let Newline = createToken({
    name: "Newline",
    pattern: /(\n|\r)/,
    group: Lexer.SKIPPED
});

let Spaces = createToken({
    name: "Spaces",
    pattern: /(' '|\t)+/,
    group: Lexer.SKIPPED
});
let Freestyle = createToken({
  name: "Freestyle",
  pattern: /.+/
});
let allTokens = [
    Emptyline,
    // Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
    // Dedent must appear before Indent for handling zero spaces dedents.
    Dedent,
    Indent,
    IncomingSupport,
    IncomingAttack,
    OutgoingSupport,
    OutgoingAttack,
    StatementDefinition,
    StatementReference,
    ArgumentDefinition,
    ArgumentReference,
    Newline,
    Spaces,
    Freestyle
];
let customPatternLexer = new Lexer(allTokens);

module.exports = {

    // for testing purposes
    Emptyline: Emptyline,
    Indent: Indent,
    Dedent: Dedent,
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
