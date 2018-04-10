"use strict";

var _argdownParser = require("argdown-parser");

class LogParserErrorsPlugin {
    constructor() {
        this.name = "LogParserErrorsPlugin";
        //this.defaults = _.defaultsDeep({}, config, {});
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