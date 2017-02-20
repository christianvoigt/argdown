'use strict';

var _chai = require('chai');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _index = require('../src/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Parser", function () {
  it("can parse", function () {
    var source = _fs2.default.readFileSync("./test/parser.argdown", 'utf8');
    var result = _index2.default.parse(source);
    (0, _chai.expect)(result.lexErrors).to.be.empty;
    (0, _chai.expect)(result.parseErrors).to.be.empty;
  });
}); //import { before, after, describe, it } from 'mocha';
//# sourceMappingURL=parser.spec.js.map