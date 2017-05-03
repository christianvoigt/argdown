'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();
var preprocessor = new _index.ArgdownPreprocessor();
app.addPlugin(preprocessor);
var jsonExport = new _index.JSONExport();
app.addPlugin(jsonExport);

describe("JSONExport", function () {

  it("sanity test", function () {
    var source = "[Test]: Hello _World_!\n  +<Argument 1>\n    -[Test]\n\n[Test]: Tschüss!";
    app.parse(source);
    var result = app.run();
    (0, _chai.expect)(result.json).to.exist;
  });
});
//# sourceMappingURL=json-export.spec.js.map