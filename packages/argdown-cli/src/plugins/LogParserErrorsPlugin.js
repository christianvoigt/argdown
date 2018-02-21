import * as _ from 'lodash';
import {ArgdownLexer} from 'argdown-parser';

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
                const message = error.message;
                var startLine, startColumn;
                if(error.token.tokenType === ArgdownLexer.EOF){ // This is an EarlyExitError. EOF does not have a token location, but EarlyExitErrors save the previousToken parsed
                    //console.log(error);
                    if(error.previousToken){
                        startLine = error.previousToken.startLine;
                        startColumn = error.previousToken.startColumn;
                    }
                }else{
                    startLine = error.token.startLine;
                    startColumn = error.token.startColumn;
                }
                logger.log("error", `\u001b[31mAt ${startLine}:${startColumn}\u001b[0m\n${message}\n`);
            }
        }
        return data;
    }
}
module.exports = {
    LogParserErrorsPlugin: LogParserErrorsPlugin
}
