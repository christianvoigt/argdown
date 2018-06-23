"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@argdown/node");
exports.command = "*";
exports.desc = "load config file and run process";
exports.handler = async (argv) => {
    let config = await node_1.argdown.loadConfig(argv.config);
    config.logLevel = argv.verbose ? "verbose" : config.logLevel;
    config.watch = argv.watch || config.watch;
    config.logParserErrors = argv.logParserErrors || config.logParserErrors;
    await node_1.argdown.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=DefaultCommand.js.map