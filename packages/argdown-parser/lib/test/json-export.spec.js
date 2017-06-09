'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();
var parserPlugin = new _index.ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');
var modelPlugin = new _index.ModelPlugin();
app.addPlugin(modelPlugin, 'build-model');
var jsonExport = new _index.JSONExport();
app.addPlugin(jsonExport, 'export-json');

describe("JSONExport", function () {

  it("sanity test", function () {
    var source = "[Test]: Hello _World_!\n  +<Argument 1>\n    -[Test]\n\n[Test]: Tschüss!";
    var result = app.run(['parse-input', 'build-model', 'export-json'], { input: source });
    (0, _chai.expect)(result.json).to.exist;
  });
});
//# sourceMappingURL=json-export.spec.js.map