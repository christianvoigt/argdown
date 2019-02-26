import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";

export const command = "json [inputGlob] [outputDir]";
export const desc = "export Argdown input as JSON files";
export const builder = {
  logParserErrors: {
    alias: "e",
    describe: "Log parser errors to console",
    type: "boolean",
    default: true
  },
  spaces: {
    alias: "s",
    describe: "Spaces used for indentation",
    type: "number"
  },
  removeMap: {
    describe: "Remove map data",
    type: "boolean"
  },
  removeEmbeddedRelations: {
    describe: "Remove relations embedded in statement and relation objects",
    type: "boolean"
  }
};
export interface IJSONCliOptions {
  inputGlob?: string;
  outputDir?: string;
  spaces?: number;
}
export const handler = async (
  args: Arguments<IGeneralCliOptions & IJSONCliOptions>
) => {
  let config = await argdown.loadConfig(args.config);

  config.json = config.json || {};

  if (args.spaces !== null) {
    config.json.spaces = args.spaces;
  }
  if (args.removeEmbeddedRelations) {
    config.json.removeEmbeddedRelations = true;
  }
  if (args.removeMap) {
    config.json.exportMap = false;
  }

  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (args.outputDir) {
    config.saveAs.outputDir = args.outputDir;
  }

  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.process = ["load-file", "parse-input"];
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push("build-model");
  config.process.push("colorize");
  config.process.push("export-json");

  if (!args.stdout || args.outputDir) {
    config.process.push("save-as-json");
  }
  if (args.stdout) {
    config.process.push("stdout-json");
  }

  await argdown.load(config).catch(e => console.log(e));
};
