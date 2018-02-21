'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _argdownParser = require('argdown-parser');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LogParserErrorsPlugin = function () {
    _createClass(LogParserErrorsPlugin, [{
        key: 'config',
        set: function set(config) {
            var previousSettings = this.settings;
            if (!previousSettings) {
                previousSettings = {};
            }
            this.settings = _.defaultsDeep({}, config, previousSettings);
        }
    }]);

    function LogParserErrorsPlugin(config) {
        _classCallCheck(this, LogParserErrorsPlugin);

        this.name = "LogParserErrorsPlugin";
        this.config = config;
    }

    _createClass(LogParserErrorsPlugin, [{
        key: 'run',
        value: function run(data, logger) {
            if (data.parserErrors && data.parserErrors.length > 0) {
                var inputFile = data.inputFile;
                var nrOfErrors = data.parserErrors.length;
                if (inputFile) {
                    logger.log("error", '\x1B[31m\x1B[1mArgdown syntax errors in ' + inputFile + ': ' + nrOfErrors + '\x1B[0m\n');
                } else {
                    logger.log("error", '\x1B[31m\x1B[1mArgdown syntax errors in input: ' + nrOfErrors + '\x1B[0m\n');
                }
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = data.parserErrors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var error = _step.value;

                        var message = error.message;
                        var startLine, startColumn;
                        if (error.token.tokenType === _argdownParser.ArgdownLexer.EOF) {
                            // This is an EarlyExitError. EOF does not have a token location, but EarlyExitErrors save the previousToken parsed
                            //console.log(error);
                            if (error.previousToken) {
                                startLine = error.previousToken.startLine;
                                startColumn = error.previousToken.startColumn;
                            }
                        } else {
                            startLine = error.token.startLine;
                            startColumn = error.token.startColumn;
                        }
                        logger.log("error", '\x1B[31mAt ' + startLine + ':' + startColumn + '\x1B[0m\n' + message + '\n');
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
            return data;
        }
    }]);

    return LogParserErrorsPlugin;
}();

module.exports = {
    LogParserErrorsPlugin: LogParserErrorsPlugin
};
//# sourceMappingURL=LogParserErrorsPlugin.js.map