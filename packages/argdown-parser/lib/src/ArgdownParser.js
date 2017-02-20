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

    var _this = _possibleConstructorReturn(this, (ArgdownParser.__proto__ || Object.getPrototypeOf(ArgdownParser)).call(this, input, lexer.tokens));

    var $ = _this;

    $.statements = $.RULE("statements", function () {
      var many = $.MANY_SEP(lexer.Emptyline, function () {
        return $.SUBRULE($.statement);
      });
      return { name: 'statements',
        children: many.values
      };
    });

    $.relations = $.RULE("relations", function () {
      var children = [];
      children.push($.CONSUME(lexer.Indent));
      var manyResult = $.MANY(function () {
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
      children = children.concat(manyResult);
      children.push($.CONSUME(lexer.Dedent));
      return { name: 'relations', children: children };
    });

    $.incomingSupport = $.RULE("incomingSupport", function () {
      var children = [];
      children.push($.CONSUME(lexer.IncomingSupport));
      children.push($.SUBRULE($.statement));
      return { name: 'incomingSupport', children: children };
    });
    $.incomingAttack = $.RULE("incomingAttack", function () {
      var children = [];
      children.push($.CONSUME(lexer.IncomingAttack));
      children.push($.SUBRULE($.statement));
      return { name: 'incomingAttack', children: children };
    });
    $.outgoingSupport = $.RULE("outgoingSupport", function () {
      var children = [];
      children.push($.CONSUME(lexer.OutgoingSupport));
      children.push($.SUBRULE($.statement));
      return { name: 'outgoingSupport', children: children };
    });
    $.outgoingAttack = $.RULE("outgoingAttack", function () {
      var children = [];
      children.push($.CONSUME(lexer.OutgoingAttack));
      children.push($.SUBRULE($.statement));
      return { name: 'outgoingAttack', children: children };
    });

    $.statement = $.RULE("statement", function () {
      var children = [];
      children[0] = $.OR([{ ALT: function ALT() {
          return $.SUBRULE1($.statementContent);
        } }, { ALT: function ALT() {
          return $.CONSUME(lexer.StatementReference);
        } }, { ALT: function ALT() {
          var children = [];
          children.push($.CONSUME(lexer.StatementDefinition));
          children.push($.SUBRULE2($.statementContent));
          return children;
        } }]);
      $.OPTION(function () {
        children.push($.SUBRULE($.relations));
      });
      return { name: 'statement', children: children };
    });

    $.statementContent = $.RULE("statementContent", function () {
      var children = $.MANY(function () {
        return $.CONSUME(lexer.Freestyle);
      });
      return { name: 'statementContent', children: children };
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
//# sourceMappingURL=ArgdownParser.js.map