#!/usr/bin/env node
"use strict";
/*jshint esversion: 6 */
/*jslint node: true */

import yargs = require("yargs");
require("pkginfo")(module, "version");

yargs
  .showHelpOnFail(true)
  .scriptName("argdown")
  .options({
    watch: {
      alias: "w",
      describe: "Watch the input files for changes",
      type: "boolean",
      default: false
    },
    config: {
      alias: "cfg",
      describe: "The path to the config .js file.",
      type: "string"
    },
    verbose: {
      alias: "v",
      type: "boolean",
      describe: "verbose mode"
    },
    silent: {
      type: "boolean",
      describe: "silent mode"
    },
    stdout: {
      type: "boolean",
      describe: "Export data to stdout"
    },
    throwExceptions: {
      type: "boolean",
      describe: "Throw errors"
    },
    logParserErrors: {
      alias: "e",
      describe: "Log parser errors to console",
      type: "boolean",
      default: true
    }
  })
  .commandDir("./commands")
  .demandCommand()
  .help()
  .version(module.exports.version).argv;
