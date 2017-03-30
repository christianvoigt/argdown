'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

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
    (0, _chai.expect)(result.html).to.equal("<!doctype html>\n\n<html lang='en'>\n<head>\n<meta charset='utf8'>\n<title>Title</title>\n<link rel='stylesheet' href='./argdown.css'>\n</head><body><div class='argdown'><h1>Title</h1><div class='statement'><span class='definition statement-definition definiendum'>[<span class='title statement-title'>Statement</span>]: </span>Hello World!<div class='relations'><div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div><div class='argument-reference'>&lt;<span class='title argument-title'>Argument</span>&gt; </div></div></div></div><div class='argument-definition'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>Argument</span>&gt;: </span><span class='argument-definiens definiens description'>Description</span></div></body></html>");
  });
});
//# sourceMappingURL=html-export.spec.js.map