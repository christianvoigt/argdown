"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.desc = exports.command = undefined;

var _index = require("../index.js");

const command = exports.command = "run [process]";
const desc = exports.desc = "run a process you have defined in your config file";
const handler = exports.handler = function (argv) {
  const processName = argv.process || "default";
  let config = _index.app.loadConfig(argv.config);
  if (!config.process || processName !== "default") {
    if (config.processes && config.processes[processName]) {
      config.process = config.processes[processName];
    }
  }
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  _index.app.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=RunCommand.js.map