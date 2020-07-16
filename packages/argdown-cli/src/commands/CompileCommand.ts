import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";
import { runArgdown } from "./runArgdown";

export const command = "compile [inputGlob] [outputDir]";
export const desc = "compile included Argdown files into main file";
export const builder = {};
export interface ICompileCliOptions {
  inputGlob?: string;
  outputDir?: string;
}

export const handler = async (
  args: Arguments<IGeneralCliOptions & ICompileCliOptions>
) => {
  let config = await argdown.loadConfig(args.config);

  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (args.outputDir) {
    config.saveAs.outputDir = args.outputDir;
  }

  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.logLevel = args.silent ? "silent" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.process = ["load-file"];
  config.throwExceptions = args.throwExceptions || config.throwExceptions;
  if (args.throwExceptions) {
    if (!config.parser) {
      config.parser = {};
    }
    config.parser.throwExceptions = args.throwExceptions;
  }
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (!args.stdout || args.outputDir) {
    config.process.push("save-as-argdown");
  }
  if (args.stdout) {
    config.process.push("stdout-argdown");
  }
  runArgdown(argdown, config, true, "Compilation failed", "compiled");
};
