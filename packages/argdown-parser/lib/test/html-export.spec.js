'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _index.ArgdownApplication();
var preprocessor = new _index.ArgdownPreprocessor();
app.addPlugin(preprocessor, 'preprocessor');

describe("HtmlExport", function () {
  var htmlExport = new _index.HtmlExport();
  app.addPlugin(htmlExport, "export-html");
  it("can export Argdown", function () {
    var source = "#Title\n\n[Statement]: Hello World!\n +<Argument>\n\n<Argument>: Description";
    app.parse(source);
    var result = app.run(['preprocessor', 'export-html']);
    //console.log(result.html);
    (0, _chai.expect)(result.html).to.equal("<!doctype html>\n\n<html lang='en'>\n<head>\n<meta charset='utf8'>\n<title>Title</title>\n<link rel='stylesheet' href='./argdown.css'>\n</head><body><div class='argdown'><h1 id='heading-title'>Title</h1><div class='statement'><span id='statement-statement' class='definition statement-definition definiendum'>[<span class='title statement-title'>Statement</span>]: </span>Hello World!<div class='relations'><div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div><a href='#argument-argument' class='reference argument-reference'>&lt;<span class='title argument-title'>Argument</span>&gt; </a></div></div></div><div id='argument-argument' class='definition argument-definition'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>Argument</span>&gt;: </span><span class='argument-definiens definiens description'>Description</span></div></body></html>");
  });
  it("can export the argdown intro", function () {
    var source = _fs2.default.readFileSync("./test/intro.argdown", 'utf8');
    app.parse(source);
    var result = app.run(['preprocessor', 'export-html']);
    (0, _chai.expect)(result.lexerErrors).to.be.empty;
    (0, _chai.expect)(result.parserErrors).to.be.empty;
  });
  it("can create class names for tags", function () {
    var source = 'Test #tag1\n      + test #tag2\n        - test #tag3';
    app.parse(source);
    var result = app.run(['preprocessor', 'export-html']);
    (0, _chai.expect)(htmlExport.tagsDictionary).to.exist;
    (0, _chai.expect)(Object.keys(htmlExport.tagsDictionary).length).to.be.equal(3);
    (0, _chai.expect)(htmlExport.tagsDictionary["tag1"].cssClassName).to.be.equal("tag-tag1");
    (0, _chai.expect)(htmlExport.tagsDictionary["tag2"].cssClassName).to.be.equal("tag-tag2");
    (0, _chai.expect)(htmlExport.tagsDictionary["tag3"].cssClassName).to.be.equal("tag-tag3");
  });
});
//# sourceMappingURL=html-export.spec.js.map