"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@argdown/node");
exports.command = "compile [inputGlob] [outputDir]";
exports.desc = "compile included Argdown files into main file";
exports.builder = {};
exports.handler = async (argv) => {
    let config = await node_1.argdown.loadConfig(argv.config);
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
    await node_1.argdown.load(config).catch((e) => console.log(e));
};
//# sourceMappingURL=CompileCommand.js.map