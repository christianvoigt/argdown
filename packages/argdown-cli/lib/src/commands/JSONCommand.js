'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.desc = exports.command = undefined;

var _index = require('../index.js');

var command = exports.command = 'json [inputGlob] [outputDir]';
var desc = exports.desc = 'export Argdown input as JSON files';
var builder = exports.builder = {
  spaces: {
    alias: 's',
    describe: 'Spaces used for indentation',
    type: 'number'
  },
  removeMap: {
    describe: 'Remove map data',
    type: 'boolean'
  },
  removeEmbeddedRelations: {
    describe: 'Remove relations embedded in statement and relation objects',
    type: 'boolean'
  }
};
var handler = exports.handler = function handler(argv) {
  var config = _index.app.loadConfig(argv.config);

  config.json = config.json || config.JSONExport || {};

  if (argv.spaces !== null) {
    config.json.spaces = argv.spaces;
  }
  if (argv.removeEmbeddedRelations) {
    config.json.removeEmbeddedRelations = true;
  }
  if (argv.removeMap) {
    config.json.exportMap = false;
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
  config.process = ["preprocessor", "export-json", "save-as-json"];
  _index.app.load(config);
};
//# sourceMappingURL=JSONCommand.js.map