#!/usr/bin/env node
'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

import yargs from "yargs";
import {version} from '../../package.json';

yargs
  .options({
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
    },
    stdout: {
      type: 'boolean',
      describe: 'Export data to stdout'
    }
  })
  .commandDir('commands')
  .help()
  .version(version)
  .argv;
