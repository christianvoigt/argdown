'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.desc = exports.command = undefined;

var _index = require('../index.js');

var command = exports.command = 'argml [inputGlob] [outputDir]';
var desc = exports.desc = 'export Argdown input as .graphml files';
var builder = exports.builder = {
  statementSelectionMode: {
    alias: 'statement-selection',
    type: 'string',
    choices: ['all', 'titled', 'roots', 'statement-trees', 'with-relations']
  },
  inclusive: {
    type: 'boolean',
    describe: 'Include disconnected nodes.'
  }
};
var handler = exports.handler = function handler(argv) {
  var config = _index.app.loadConfig(argv.config);

  config.map = config.map || config.MapMaker || {};
  // if(argv.argumentLabelMode){
  //   config.map.argumentLabelMode = argv.argumentLabelMode;        
  // }
  // if(argv.statementLabelMode){
  //   config.map.statementLabelMode = argv.statementLabelMode;        
  // }
  if (argv.statementSelectionMode) {
    config.map.statementSelectionMode = argv.statementSelectionMode;
  }
  if (argv.inclusive) {
    config.map.excludeDisconnected = false;
  }
  if (argv.inputGlob) {
    config.input = argv.inputGlob;
  }
  config.saveAs = config.saveAs || config.SaveAsFilePlugin || {};
  if (argv.outputDir) {
    config.saveAs.outputDir = argv.outputDir;
  }
  config.verbose = argv.verbose || config.verbose;
  config.watch = argv.watch || config.watch;
  config.process = ["preprocessor", "export-argml", "save-as-argml"];
  _index.app.load(config);
};
//# sourceMappingURL=ArgMLCommand.js.map