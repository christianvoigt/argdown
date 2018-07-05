import { argdown } from "@argdown/node";
import { Arguments } from "yargs";

export const command = "run [process]";
export const desc = "run a process you have defined in your config file";
export const handler = async (argv: Arguments) => {
  const processName = argv.process || "default";
  let config = await argdown.loadConfig(argv.config);
  config.process = processName;
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  await argdown.load(config).catch(e => console.log(e));
};
