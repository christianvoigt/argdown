#!/usr/bin/env node
'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

var program = require('commander-file');
var argdownParser = require('argdown-parser');

program
  .version('0.0.0')
  .usage('<file/url> [options...]')
  .parse(process.argv).then(function(data){
    if(data !== null){
      //console.log(data);
      let result = argdownParser.tokenize(data);

      for(let token of result.tokens){
        console.log(token.constructor.name);
      }
    }
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
