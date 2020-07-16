import { IArgdownRequest, ArgdownPluginError } from "@argdown/core";
import { AsyncArgdownApplication } from "@argdown/node";

export const runArgdown = async (
  argdown: AsyncArgdownApplication,
  config: IArgdownRequest,
  checkParserErrors: boolean,
  failureMessage: string, // e.g. "HTML export canceled"
  successVerb: string, // e.g. "exported"
  preposition?: string // e.g. "to html"
) => {
  const throwExceptions = config.throwExceptions;
  config.throwExceptions = true;
  try {
    const responses = await argdown.load(config);
    if (responses && Array.isArray(responses) && responses.length > 0) {
      if (checkParserErrors) {
        for (var r of responses) {
          if (r.parserErrors && r.parserErrors.length > 0) {
            process.exitCode = 1;
            break;
          }
        }
      }
      if (config.logLevel !== "silent") {
        console.log(
          `\u001b[32m\u001b[1mSuccessfully ${successVerb} ${responses.length} ${
            responses.length > 1 ? "files" : "file"
          }${preposition ? " " + preposition : ""}.\u001b[0m\n`
        );
      }
    }
  } catch (e) {
    if (throwExceptions) {
      throw e;
    } else {
      process.exitCode = 1;
      if (config.logLevel !== "silent") {
        if (e instanceof ArgdownPluginError) {
          console.log(
            `\u001b[31m\u001b[1m${failureMessage}: ${e.message}\u001b[0m\n`
          );
        } else {
          console.log(e);
        }
      }
    }
  }
};
