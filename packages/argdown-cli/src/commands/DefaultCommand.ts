import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";
import { runArgdown } from "./runArgdown";

export const command = "* [inputGlob]";
export const desc = "load config file and run parser";
export const handler = async (
  args: Arguments<IGeneralCliOptions> & { inputGlob?: string }
) => {
  let config = await argdown.loadConfig(args.config);
  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (!config.process) {
    config.process = ["load-file", "parse-input"];
    if (config.logParserErrors) {
      config.process.push("log-parser-errors");
    }
  }
  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.logLevel = args.silent ? "silent" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.throwExceptions = args.throwExceptions || config.throwExceptions;
  if (config.throwExceptions) {
    if (!config.parser) {
      config.parser = {};
    }
    config.parser.throwExceptions = config.throwExceptions;
  }
  await runArgdown(
    argdown,
    config,
    true,
    "Further processing of file stopped",
    "checked"
  );
};
