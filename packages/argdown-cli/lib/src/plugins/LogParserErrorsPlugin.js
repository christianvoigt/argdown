'use strict';

var _lodash = require('lodash');

var _ = _interopRequireWildcard(_lodash);

var _argdownParser = require('argdown-parser');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class LogParserErrorsPlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {};
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
    }
    constructor(config) {
        this.name = "LogParserErrorsPlugin";
        this.config = config;
    }
    run(request, response, logger) {
        if (response.parserErrors && response.parserErrors.length > 0) {
            const inputFile = request.inputFile;
            const nrOfErrors = response.parserErrors.length;
            if (inputFile) {
                logger.log("error", `\u001b[31m\u001b[1mArgdown syntax errors in ${inputFile}: ${nrOfErrors}\u001b[0m\n`);
            } else {
                logger.log("error", `\u001b[31m\u001b[1mArgdown syntax errors in input: ${nrOfErrors}\u001b[0m\n`);
            }
            for (let error of response.parserErrors) {
                const message = error.message;
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
                logger.log("error", `\u001b[31mAt ${startLine}:${startColumn}\u001b[0m\n${message}\n`);
            }
        }
        return response;
    }
}
module.exports = {
    LogParserErrorsPlugin: LogParserErrorsPlugin
};
//# sourceMappingURL=LogParserErrorsPlugin.js.map