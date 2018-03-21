'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.desc = exports.command = undefined;

var _index = require('../index.js');

const command = exports.command = 'compile [inputGlob] [outputDir]';
const desc = exports.desc = 'compile included Argdown files into main file';
const builder = exports.builder = {};
const handler = exports.handler = function (argv) {
  let config = _index.app.loadConfig(argv.config);

  if (argv.inputGlob) {
    config.inputPath = argv.inputGlob;
  }
  config.saveAs = config.saveAs || config.SaveAsFilePlugin || {};
  if (argv.outputDir) {
    config.saveAs.outputDir = argv.outputDir;
  }

  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.process = ['preprocessor'];
  if (!argv.stdout || argv.outputDir) {
    config.process.push('save-as-argdown');
  }
  if (argv.stdout) {
    config.process.push('stdout-argdown');
  }
  _index.app.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=CompileCommand.js.map