'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _ArgdownLexer = require('../ArgdownLexer.js');

var _ArgdownParser = require('../ArgdownParser.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
    value: function run(data) {
      if (!data.input) {
        return data;
      }
      var verbose = data.config && data.config.verbose;

      var lexResult = this.lexer.tokenize(data.input);
      data.tokens = lexResult.tokens;
      data.lexerErrors = lexResult.errors;

      this.parser.input = lexResult.tokens;
      data.ast = this.parser.argdown();
      data.parserErrors = this.parser.errors;

      if (verbose && data.lexerErrors && data.lexerErrors.length > 0) {
        console.log(data.lexerErrors);
      }
      if (verbose && data.parserErrors && data.parserErrors.length > 0) {
        console.log(data.parserErrors);
      }
      return data;
    }
  }]);

  return ParserPlugin;
}();

module.exports = {
  ParserPlugin: ParserPlugin
};
//# sourceMappingURL=ParserPlugin.js.map