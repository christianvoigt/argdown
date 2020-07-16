import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";
import { runArgdown } from "./runArgdown";

export const command = "run [process]";
export const desc = "run a process you have defined in your config file";
export interface IRunCliOptions {
  process: string;
}
export const handler = async (
  args: Arguments<IGeneralCliOptions & IRunCliOptions>
) => {
  const processName = args.process || "default";
  let config = await argdown.loadConfig(args.config);
  config.process = processName;
  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.logLevel = args.silent ? "silent" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  await runArgdown(
    argdown,
    config,
    true,
    "Custom process canceled",
    "processed"
  );
};
