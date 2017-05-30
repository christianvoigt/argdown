'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.desc = exports.command = undefined;

var _index = require('../index.js');

var command = exports.command = '*';
var desc = exports.desc = 'load config file, parse argdown input and run argdown processors';
var handler = exports.handler = function handler(argv) {
  var config = _index.app.loadConfig(argv.config);
  config.verbose = argv.verbose || config.verbose;
  config.watch = argv.watch || config.watch;
  _index.app.load(config);
};
//# sourceMappingURL=DefaultCommand.js.map