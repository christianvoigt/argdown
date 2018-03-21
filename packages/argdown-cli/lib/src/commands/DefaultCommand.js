'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.desc = exports.command = undefined;

var _index = require('../index.js');

const command = exports.command = '*';
const desc = exports.desc = 'load config file, parse argdown input and run argdown processors';
const handler = exports.handler = function (argv) {
  let config = _index.app.loadConfig(argv.config);
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  _index.app.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=DefaultCommand.js.map