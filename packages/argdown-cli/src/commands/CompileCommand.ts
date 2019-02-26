import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";

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
  config.watch = args.watch || config.watch;
  config.process = ["load-file"];
  if (!args.stdout || args.outputDir) {
    config.process.push("save-as-argdown");
  }
  if (args.stdout) {
    config.process.push("stdout-argdown");
  }
  await argdown.load(config).catch((e: Error) => console.log(e));
};
