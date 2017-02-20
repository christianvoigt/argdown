#!/usr/bin/env node

'use strict';
/*jshint esversion: 6 */
/*jslint node: true */

var program = require('commander-file');
var argdownParser = require('argdown-parser');

program.version('0.0.0').usage('<file/url> [options...]').parse(process.argv).then(function (data) {
  if (data !== null) {
    //console.log(data);
    var result = argdownParser.tokenize(data);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = result.tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var token = _step.value;

        console.log(token.constructor.name);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }
});

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
//# sourceMappingURL=cli.js.map