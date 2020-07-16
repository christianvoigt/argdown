import {
  IArgdownPlugin,
  IRequestHandler,
  TokenNames,
  ArgdownPluginError
} from "@argdown/core";
declare module "@argdown/core" {
  interface IArgdownRequest {
    logParserErrors?: boolean;
  }
}
export class LogParserErrorsPlugin implements IArgdownPlugin {
  name = "LogParserErrorsPlugin";
  run: IRequestHandler = (request, response, logger) => {
    if (response.parserErrors && response.parserErrors.length > 0) {
      process.exitCode = 1;
      if (request.logParserErrors) {
        const inputFile = request.inputPath;
        const nrOfErrors = response.parserErrors.length;
        if (inputFile) {
          logger.log(
            "error",
            `\u001b[31m\u001b[1mArgdown syntax errors in ${inputFile}: ${nrOfErrors}\u001b[0m\n`
          );
        } else {
          logger.log(
            "error",
            `\u001b[31m\u001b[1mArgdown syntax errors in input: ${nrOfErrors}\u001b[0m\n`
          );
        }
        for (let error of response.parserErrors) {
          const message = error.message;
          var startLine, startColumn;
          if (
            error.token &&
            error.token.tokenType &&
            error.token.tokenType.name === TokenNames.EOF
          ) {
            // EOF does not have a token location, but the error saves the previousToken parsed
            if ((<any>error).previousToken) {
              startLine = (<any>error).previousToken.startLine;
              startColumn = (<any>error).previousToken.startColumn;
            }
          } else {
            startLine = error.token.startLine;
            startColumn = error.token.startColumn;
          }
          logger.log(
            "error",
            `\u001b[31mAt ${startLine}:${startColumn}\u001b[0m\n${message}\n`
          );
        }
      }
      // Stop further processing by throwing an error
      throw new ArgdownPluginError(
        this.name,
        "parser-errors",
        "Invalid Argdown syntax detected."
      );
    }
    return response;
  };
}
