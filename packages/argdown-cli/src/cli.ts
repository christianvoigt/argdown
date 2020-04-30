#!/usr/bin/env node
"use strict";
/*jshint esversion: 6 */
/*jslint node: true */

import yargs = require("yargs");
require("pkginfo")(module, "version");

yargs
  .showHelpOnFail(true)
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
    stdout: {
      type: "boolean",
      describe: "Export data to stdout"
    }
  })
  .commandDir("./commands")
  .demandCommand()
  .help()
  .version(module.exports.version).argv;
