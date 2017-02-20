'use strict';

var _chai = require('chai');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('../src/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var testString = _fs2.default.readFileSync("lib/test/test.argdown", 'utf8'); //import { before, after, describe, it } from 'mocha';


var lexResult = _index2.default.tokenize(testString);

debugger;
for (var i = 0; i < lexResult.length; i++) {
  var token = lexResult[i];
  console.log(token.name);
}

describe("A test suite", function () {
  it("Should be a string", function () {
    (0, _chai.expect)(testString).to.be.a("string");
  });
});
//# sourceMappingURL=test.spec.js.map