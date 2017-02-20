'use strict';

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var createToken = chevrotain.createToken;
var Lexer = chevrotain.Lexer;

// State required for matching the indentations
var indentStack = [0];

function getCurrentLine(matchedTokens) {
  var matchedTokensIsEmpty = _.isEmpty(matchedTokens);
  if (matchedTokensIsEmpty) return 0;

  var last = _.last(matchedTokens);
  var currentLine = chevrotain.getEndLine(last);
  if (last instanceof Emptyline) currentLine++;
  return currentLine;
}
function emitRemainingDedentTokens(matchedTokens) {
  if (indentStack.length <= 1) return;
  var lastToken = _.last(matchedTokens.tokens);
  var lastOffset = lastToken ? chevrotain.getEndOffset(lastToken) : 0;
  var lastLine = lastToken ? chevrotain.getEndLine(lastToken) : 0;
  var lastColumn = lastToken ? chevrotain.getEndColumn(lastToken) : 0;

  //add remaining Dedents
  while (indentStack.length > 1) {
    matchedTokens.push(new Dedent("", lastOffset, lastLine, lastColumn));
    indentStack.pop();
  }
}

function emitIndentOrDedent(matchedTokens, groups, indentStr) {
  var currIndentLevel = indentStr.length;
  var lastIndentLevel = _.last(indentStack);
  var image = "";
  var last = _.last(matchedTokens);
  var offset = last ? chevrotain.getEndOffset(last) + 1 : 0;
  var line = getCurrentLine(matchedTokens, groups.nl);
  var column = last ? chevrotain.getEndColumn(last) + 1 : 0;
  if (currIndentLevel > lastIndentLevel) {
    indentStack.push(currIndentLevel);
    var indentToken = new Indent(image, offset, line, column);
    matchedTokens.push(indentToken);
  } else if (currIndentLevel < lastIndentLevel) {
    while (indentStack.length > 1 && currIndentLevel < _.last(indentStack)) {
      indentStack.pop();
      var dedentToken = new Dedent(image, offset, line, column);
      matchedTokens.push(dedentToken);
    }
  }
}

function matchRelation(text, matchedTokens, groups, pattern) {
  var startsWithNewline = /^[\n\r|\n|\r]/.exec(text) != null;
  if (_.isEmpty(matchedTokens) || startsWithNewline) {
    var match = pattern.exec(text);
    if (match !== null && match.length == 3) {
      var indentStr = match[1];
      emitIndentOrDedent(matchedTokens, groups, indentStr);
      return match;
    }
  }
  return null;
}
//relations start at BOF or after a newline, optionally followed by indentation (spaces or tabs)
var matchIncomingSupport = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(\+>)/);
var matchIncomingAttack = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(->)/);
var matchOutgoingSupport = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(<?\+)/);
var matchOutgoingAttack = _.partialRight(matchRelation, /^[\n\r|\n|\r]?([' '\t]*)(<?-)/);

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

var emptylinePattern = /^([\n\r|\n|\r]{2,})[^\s\t]/; //two linebreaks, not followed by whitespace
function emptylineMatching(text, matchedTokens) {
  var match = emptylinePattern.exec(text);
  if (match !== null && match.length == 2) {
    emitRemainingDedentTokens(matchedTokens);
    match[0] = match[1];
    return match;
  }
  return null;
}
var Emptyline = createToken({
  name: "Emptyline",
  pattern: emptylineMatching
});

//Indent and Dedent are never matched with their own patterns, instead they get matched in the relations custom patterns
var Indent = createToken({
  name: "Indent",
  pattern: Lexer.NA
});
var Dedent = createToken({
  name: "Dedent",
  pattern: Lexer.NA
});

var StatementDefinition = createToken({
  name: "StatementDefinition",
  pattern: /\[.+\]\:/
});

var StatementReference = createToken({
  name: "StatementReference",
  pattern: /\[.+\]/
});

var ArgumentDefinition = createToken({
  name: "ArgumentDefinition",
  pattern: /\<.+\>\:/
});

var ArgumentReference = createToken({
  name: "ArgumentReference",
  pattern: /\<.+\>/
});

var Newline = createToken({
  name: "Newline",
  pattern: /(\n|\r)/,
  group: Lexer.SKIPPED
});

var Spaces = createToken({
  name: "Spaces",
  pattern: /(' '|\t)+/,
  group: Lexer.SKIPPED
});
var Freestyle = createToken({
  name: "Freestyle",
  pattern: /.+/
});
var allTokens = [Emptyline,
// Relation tokens must appear before Spaces, otherwise all indentation will always be consumed as spaces.
// Dedent must appear before Indent for handling zero spaces dedents.
Dedent, Indent, IncomingSupport, IncomingAttack, OutgoingSupport, OutgoingAttack, StatementDefinition, StatementReference, ArgumentDefinition, ArgumentReference, Newline, Spaces, Freestyle];
var customPatternLexer = new Lexer(allTokens);

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

  logTokens: function logTokens(lexResult) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = lexResult.tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
  },

  tokens: allTokens,

  tokenize: function tokenize(text) {

    // have to reset the indent stack between processing of different text inputs
    indentStack = [0];

    var lexResult = customPatternLexer.tokenize(text);

    emitRemainingDedentTokens(lexResult.tokens);

    if (lexResult.errors.length > 0) {
      throw new Error("sad sad panda lexing errors detected");
    }
    return lexResult;
  }
};
//# sourceMappingURL=ArgdownLexer.js.map