"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@argdown/node");
exports.command = "run [process]";
exports.desc = "run a process you have defined in your config file";
exports.handler = async (argv) => {
    const processName = argv.process || "default";
    let config = await node_1.argdown.loadConfig(argv.config);
    config.process = processName;
    config.logLevel = argv.verbose ? "verbose" : config.logLevel;
    config.watch = argv.watch || config.watch;
    config.logParserErrors = argv.logParserErrors || config.logParserErrors;
    await node_1.argdown.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=RunCommand.js.map