import { argdown } from "@argdown/node";
import { Arguments } from "yargs";

export const command = "compile [inputGlob] [outputDir]";
export const desc = "compile included Argdown files into main file";
export const builder = {};
export const handler = async (argv: Arguments) => {
  let config = await argdown.loadConfig(argv.config);

  if (argv.inputGlob) {
    config.inputPath = argv.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (argv.outputDir) {
    config.saveAs.outputDir = argv.outputDir;
  }

  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.process = ["load-file"];
  if (!argv.stdout || argv.outputDir) {
    config.process.push("save-as-argdown");
  }
  if (argv.stdout) {
    config.process.push("stdout-argdown");
  }
  await argdown.load(config).catch((e: Error) => console.log(e));
};
