import { app } from "../index.js";

export const command = "run [process]";
export const desc = "run a process you have defined in your config file";
export const handler = function(argv) {
  const processName = argv.process || "default";
  let config = app.loadConfig(argv.config);
  if (!config.process || processName !== "default") {
    if (config.processes && config.processes[processName]) {
      config.process = config.processes[processName];
    }
  }
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  app.load(config).catch(e => console.log(e));
};
