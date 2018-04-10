"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require("lodash");

var _ = _interopRequireWildcard(_lodash);

var _ArgdownLexer = require("../ArgdownLexer.js");

var _ArgdownParser = require("../ArgdownParser.js");

var _chevrotain = require("chevrotain");

var chevrotain = _interopRequireWildcard(_chevrotain);

var _PluginWithSettings2 = require("./PluginWithSettings.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var tokenMatcher = chevrotain.tokenMatcher;

var ParserPlugin = function (_PluginWithSettings) {
    _inherits(ParserPlugin, _PluginWithSettings);

    function ParserPlugin(config) {
        _classCallCheck(this, ParserPlugin);

        var _this = _possibleConstructorReturn(this, (ParserPlugin.__proto__ || Object.getPrototypeOf(ParserPlugin)).call(this, null, config));

        _this.name = "ParserPlugin";
        _this.lexer = _ArgdownLexer.ArgdownLexer;
        _this.parser = _ArgdownParser.ArgdownParser;
        return _this;
    }

    _createClass(ParserPlugin, [{
        key: "run",
        value: function run(request, response, logger) {
            if (!request.input) {
                return response;
            }
            this.reset();

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
}(_PluginWithSettings2.PluginWithSettings);

module.exports = {
    ParserPlugin: ParserPlugin
};
//# sourceMappingURL=ParserPlugin.js.map