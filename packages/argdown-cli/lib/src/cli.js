#!/usr/bin/env node

'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _package = require('../../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_yargs2.default.options({
  watch: {
    alias: 'w',
    describe: 'Watch the input files for changes',
    type: 'boolean',
    default: false
  },
  config: {
    alias: 'cfg',
    describe: 'The path to the config .js file.',
    type: 'string'
  },
  verbose: {
    alias: 'v',
    type: 'boolean',
    describe: 'verbose mode'
  }
}).commandDir('commands').help().version(_package.version).argv;
//# sourceMappingURL=cli.js.map