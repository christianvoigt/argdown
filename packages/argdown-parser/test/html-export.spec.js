import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor,HtmlExport} from '../src/index.js';

let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor,'preprocessor');

describe("HtmlExport", function() {
  let htmlExport = new HtmlExport();
  app.addPlugin(htmlExport, "export-html");
  it("can export Argdown", function(){
    let source = "#Title\n\n[Statement]: Hello World!\n +<Argument>\n\n<Argument>: Description";
    app.parse(source);
    let result = app.run(['preprocessor','export-html']);
    //console.log(result.html);
    expect(result.html).to.equal("<!doctype html>\n\n<html lang='en'>\n<head>\n<meta charset='utf8'>\n<title>Title</title>\n<link rel='stylesheet' href='./argdown.css'>\n</head><body><div class='argdown'><h1>Title</h1><div class='statement'><span class='definition statement-definition definiendum'>[<span class='title statement-title'>Statement</span>]: </span>Hello World!<div class='relations'><div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div><div class='argument-reference'>&lt;<span class='title argument-title'>Argument</span>&gt; </div></div></div></div><div class='argument-definition'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>Argument</span>&gt;: </span><span class='argument-definiens definiens description'>Description</span></div></body></html>");
  });
});
