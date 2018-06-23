import { argdown, ILogParserErrorsRequest, IFileRequest } from "@argdown/node";
import { Arguments } from "yargs";

export const command = "*";
export const desc = "load config file and run process";
export const handler = async (argv: Arguments) => {
  let config = <IFileRequest & ILogParserErrorsRequest>await argdown.loadConfig(argv.config);
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  await argdown.load(config).catch(e => console.log(e));
};
