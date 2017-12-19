import * as _ from 'lodash';

class LogParserErrorsPlugin {
    set config(config) {
        let previousSettings = this.settings;
        if (!previousSettings) {
            previousSettings = {
            }
        }
        this.settings = _.defaultsDeep({}, config, previousSettings);
    }
    constructor(config) {
        this.name = "LogParserErrorsPlugin";
        this.config = config;
    }
    run(data, logger) {
        if (data.parserErrors && data.parserErrors.length > 0) {
            const inputFile = data.inputFile;
            const nrOfErrors = data.parserErrors.length;
            if(inputFile){
                logger.log("error", `\u001b[31m\u001b[1mArgdown syntax errors in ${inputFile}: ${nrOfErrors}\u001b[0m\n`);
            }else{
                logger.log("error", `\u001b[31m\u001b[1mArgdown syntax errors in input: ${nrOfErrors}\u001b[0m\n`);
            }
            for (let error of data.parserErrors) {
                const startLine = error.token.startLine;
                const startColumn = error.token.startColumn;
                const message = error.message;
                logger.log("error", `\u001b[31mAt ${startLine}:${startColumn}\u001b[0m\n${message}\n`);
            }
        }
        return data;
    }
}
module.exports = {
    LogParserErrorsPlugin: LogParserErrorsPlugin
}
