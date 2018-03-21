'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.desc = exports.command = undefined;

var _index = require('../index.js');

const command = exports.command = 'json [inputGlob] [outputDir]';
const desc = exports.desc = 'export Argdown input as JSON files';
const builder = exports.builder = {
  logParserErrors: {
    alias: 'e',
    describe: 'Log parser errors to console',
    type: 'boolean',
    default: true
  },
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
const handler = exports.handler = function (argv) {
  let config = _index.app.loadConfig(argv.config);

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
    config.inputPath = argv.inputGlob;
  }
  config.saveAs = config.saveAs || config.SaveAsFilePlugin || {};
  if (argv.outputDir) {
    config.saveAs.outputDir = argv.outputDir;
  }

  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.process = ['preprocessor', 'parse-input'];
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push('build-model');
  config.process.push('export-json');

  if (!argv.stdout || argv.outputDir) {
    config.process.push('save-as-json');
  }
  if (argv.stdout) {
    config.process.push('stdout-json');
  }

  _index.app.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=JSONCommand.js.map