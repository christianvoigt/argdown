'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.desc = exports.command = undefined;

var _index = require('../index.js');

var command = exports.command = 'compile [inputGlob] [outputDir]';
var desc = exports.desc = 'compile included Argdown files into main file';
var builder = exports.builder = {};
var handler = exports.handler = function handler(argv) {
  var config = _index.app.loadConfig(argv.config);

  if (argv.inputGlob) {
    config.input = argv.inputGlob;
  }
  config.saveAs = config.saveAs || config.SaveAsFilePlugin || {};
  if (argv.outputDir) {
    config.saveAs.outputDir = argv.outputDir;
  }

  config.verbose = argv.verbose || config.verbose;
  config.watch = argv.watch || config.watch;
  config.process = ['preprocessor'];
  if (!argv.stdout || argv.outputDir) {
    config.process.push('save-as-argdown');
  }
  if (argv.stdout) {
    config.process.push('stdout-argdown');
  }

  _index.app.load(config);
};
//# sourceMappingURL=CompileCommand.js.map