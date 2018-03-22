'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _ArgdownLexer = require('../ArgdownLexer.js');

var _ArgdownParser = require('../ArgdownParser.js');

var _chevrotain = require('chevrotain');

var chevrotain = _interopRequireWildcard(_chevrotain);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var tokenMatcher = chevrotain.tokenMatcher;

var ParserPlugin = function () {
  _createClass(ParserPlugin, [{
    key: 'config',
    set: function set(config) {
      var previousSettings = this.settings;
      if (!previousSettings) {
        previousSettings = {};
      }
      this.settings = _.defaultsDeep({}, config, previousSettings);
    }
  }]);

  function ParserPlugin(config) {
    _classCallCheck(this, ParserPlugin);

    this.name = "ParserPlugin";
    this.config = config;
    this.lexer = _ArgdownLexer.ArgdownLexer;
    this.parser = _ArgdownParser.ArgdownParser;
  }

  _createClass(ParserPlugin, [{
    key: 'run',
    value: function run(request, response, logger) {
      if (!request.input) {
        return response;
      }

      var lexResult = this.lexer.tokenize(request.input);
      response.tokens = lexResult.tokens;
      response.lexerErrors = lexResult.errors;

      this.parser.input = lexResult.tokens;
      response.ast = this.parser.argdown();
      response.parserErrors = this.parser.errors;

      if (response.lexerErrors && response.lexerErrors.length > 0) {
        logger.log("verbose", response.lexerErrors);
      }
      if (response.parserErrors && response.parserErrors.length > 0) {
        // //add location if token is EOF
        var lastToken = _.last(response.tokens);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = response.parserErrors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var error = _step.value;

            if (error.token && tokenMatcher(error.token, chevrotain.EOF)) {
              var startLine = lastToken.endLine;
              var endLine = startLine;
              var startOffset = lastToken.endOffset;
              var endOffset = startOffset;
              var startColumn = lastToken.endColumn;
              var endColumn = startColumn;
              var newToken = chevrotain.createTokenInstance(chevrotain.EOF, "", startOffset, endOffset, startLine, endLine, startColumn, endColumn);
              error.token = newToken;
            }
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
      return response;
    }
  }]);

  return ParserPlugin;
}();

module.exports = {
  ParserPlugin: ParserPlugin
};
//# sourceMappingURL=ParserPlugin.js.map