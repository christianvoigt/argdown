'use strict';

var _chevrotain = require('chevrotain');

var _chevrotain2 = _interopRequireDefault(_chevrotain);

var _ArgdownLexer = require('./ArgdownLexer.js');

var lexer = _interopRequireWildcard(_ArgdownLexer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ArgdownParser = function (_chevrotain$Parser) {
  _inherits(ArgdownParser, _chevrotain$Parser);

  function ArgdownParser(input) {
    _classCallCheck(this, ArgdownParser);

    var _this = _possibleConstructorReturn(this, (ArgdownParser.__proto__ || Object.getPrototypeOf(ArgdownParser)).call(this, input, lexer.tokens, { outputCst: true }));

    var $ = _this;

    $.argdown = $.RULE("argdown", function () {
      $.AT_LEAST_ONE_SEP({
        SEP: lexer.Emptyline,
        DEF: function DEF() {
          return $.OR({
            NAME: "$argdownOr",
            DEF: [{ ALT: function ALT() {
                return $.SUBRULE($.heading);
              } }, { ALT: function ALT() {
                return $.SUBRULE($.statement);
              } }, { ALT: function ALT() {
                return $.SUBRULE($.complexArgument);
              } }, { ALT: function ALT() {
                return $.SUBRULE($.orderedList);
              } }, { ALT: function ALT() {
                return $.SUBRULE($.unorderedList);
              } }]
          });
        }
      });
    });

    $.heading = $.RULE("heading", function () {
      $.CONSUME(lexer.HeadingStart);
      $.CONSUME(lexer.Freestyle);
    });
    $.complexArgument = $.RULE("complexArgument", function () {
      $.AT_LEAST_ONE(function () {
        return $.SUBRULE($.simpleArgument);
      });
    });
    $.simpleArgument = $.RULE("simpleArgument", function () {
      $.AT_LEAST_ONE(function () {
        return $.SUBRULE1($.argumentStatement);
      });
      $.SUBRULE($.inference);
      $.SUBRULE2($.argumentStatement);
    });
    $.argumentStatement = $.RULE("argumentStatement", function () {
      $.CONSUME(lexer.ArgumentStatementStart);
      $.SUBRULE($.statement);
    });
    $.inference = $.RULE("inference", function () {
      $.CONSUME(lexer.InferenceStart);
      $.OPTION1(function () {
        $.SUBRULE($.inferenceRules);
      });
      $.OPTION2(function () {
        $.SUBRULE($.metadata);
      });
      $.CONSUME(lexer.InferenceEnd);
    });
    $.inferenceRules = $.RULE("inferenceRules", function () {
      $.AT_LEAST_ONE_SEP1({
        SEP: lexer.ListDelimiter,
        DEF: function DEF() {
          return $.CONSUME(lexer.Freestyle);
        }
      });
    });
    $.metadata = $.RULE("metadata", function () {
      $.CONSUME(lexer.MetadataStart);
      $.AT_LEAST_ONE_SEP({
        SEP: lexer.MetadataStatementEnd,
        DEF: function DEF() {
          return $.SUBRULE($.metadataStatement);
        }
      });
    });
    $.metadataStatement = $.RULE("metadataStatement", function () {
      $.CONSUME1(lexer.Freestyle);
      $.CONSUME(lexer.Colon);
      $.AT_LEAST_ONE_SEP({
        SEP: lexer.ListDelimiter,
        DEF: function DEF() {
          return $.CONSUME2(lexer.Freestyle);
        }
      });
    });

    $.list = $.RULE("orderedList", function () {
      $.CONSUME(lexer.Indent);
      $.AT_LEAST_ONE(function () {
        return $.SUBRULE($.orderedListItem);
      });
      $.CONSUME(lexer.Dedent);
    });
    $.list = $.RULE("unorderedList", function () {
      $.CONSUME(lexer.Indent);
      $.AT_LEAST_ONE(function () {
        return $.SUBRULE($.unorderedListItem);
      });
      $.CONSUME(lexer.Dedent);
    });

    $.unorderedListItem = $.RULE("unorderedListItem", function () {
      $.CONSUME(lexer.UnorderedListItem);
      $.SUBRULE($.statement);
    });
    $.orderedListItem = $.RULE("orderedListItem", function () {
      $.CONSUME(lexer.OrderedListItem);
      $.SUBRULE($.statement);
    });

    $.statement = $.RULE("statement", function () {
      $.OR([{ ALT: function ALT() {
          return $.SUBRULE1($.statementContent);
        } }, { ALT: function ALT() {
          return $.CONSUME(lexer.StatementReference);
        } }, { ALT: function ALT() {
          $.CONSUME(lexer.StatementDefinition);
          $.SUBRULE2($.statementContent);
        } }]);
      $.OPTION(function () {
        $.SUBRULE($.relations);
      });
    });

    $.relations = $.RULE("relations", function () {
      $.CONSUME(lexer.Indent);
      $.AT_LEAST_ONE(function () {
        return $.OR([{ ALT: function ALT() {
            return $.SUBRULE($.incomingSupport);
          } }, { ALT: function ALT() {
            return $.SUBRULE($.incomingAttack);
          } }, { ALT: function ALT() {
            return $.SUBRULE($.outgoingSupport);
          } }, { ALT: function ALT() {
            return $.SUBRULE($.outgoingAttack);
          } }]);
      });
      $.CONSUME(lexer.Dedent);
    });

    $.incomingSupport = $.RULE("incomingSupport", function () {
      $.CONSUME(lexer.IncomingSupport);
      $.SUBRULE($.statement);
    });
    $.incomingAttack = $.RULE("incomingAttack", function () {
      $.CONSUME(lexer.IncomingAttack);
      $.SUBRULE($.statement);
    });
    $.outgoingSupport = $.RULE("outgoingSupport", function () {
      $.CONSUME(lexer.OutgoingSupport);
      $.SUBRULE($.statement);
    });
    $.outgoingAttack = $.RULE("outgoingAttack", function () {
      $.CONSUME(lexer.OutgoingAttack);
      $.SUBRULE($.statement);
    });
    $.statementContent = $.RULE("statementContent", function () {
      $.AT_LEAST_ONE(function () {
        return $.OR([{ ALT: function ALT() {
            return $.SUBRULE($.freestyleText);
          } }, { ALT: function ALT() {
            return $.CONSUME(lexer.Link);
          } }, { ALT: function ALT() {
            $.CONSUME(lexer.UnderscoreBoldStart);
            $.SUBRULE1($.statementContent);
            $.CONSUME(lexer.UnderscoreBoldEnd);
          } }, { ALT: function ALT() {
            $.CONSUME(lexer.StarBoldStart);
            $.SUBRULE2($.statementContent);
            $.CONSUME(lexer.StarBoldEnd);
          } }, { ALT: function ALT() {
            $.CONSUME(lexer.UnderscoreItalicStart);
            $.SUBRULE3($.statementContent);
            $.CONSUME(lexer.UnderscoreItalicEnd);
          } }, { ALT: function ALT() {
            $.CONSUME(lexer.StarItalicStart);
            $.SUBRULE4($.statementContent);
            $.CONSUME(lexer.StarItalicEnd);
          } }]);
      });
    });

    $.freestyleText = $.RULE("freestyleText", function () {
      $.AT_LEAST_ONE(function () {
        return $.OR([{ ALT: function ALT() {
            return $.CONSUME(lexer.Freestyle);
          } }, { ALT: function ALT() {
            return $.CONSUME(lexer.UnusedControlChar);
          } }]);
      });
    });
    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    _chevrotain.Parser.performSelfAnalysis(_this);
    return _this;
  }

  return ArgdownParser;
}(_chevrotain2.default.Parser);

module.exports = {
  ArgdownParser: ArgdownParser
};
//# sourceMappingURL=ArgdownParserWithoutActions.js.map