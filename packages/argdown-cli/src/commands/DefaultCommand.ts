import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";

export const command = "*";
export const desc = "load config file and run process";
export const handler = async (args: Arguments<IGeneralCliOptions>) => {
  let config = await argdown.loadConfig(args.config);
  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  await argdown.load(config).catch(e => console.log(e));
};
