import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor,HtmlExport} from '../src/index.js';
import fs from 'fs';

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
    expect(result.html).to.equal("<!doctype html>\n\n<html lang='en'>\n<head>\n<meta charset='utf8'>\n<title>Title</title>\n<link rel='stylesheet' href='./argdown.css'>\n</head><body><div class='argdown'><h1 id='heading-title'>Title</h1><div class='statement'><span id='statement-statement' class='definition statement-definition definiendum'>[<span class='title statement-title'>Statement</span>]: </span>Hello World!<div class='relations'><div class='outgoing support relation'><div class='outgoing support relation-symbol'><span>+</span></div><a href='#argument-argument' class='reference argument-reference'>&lt;<span class='title argument-title'>Argument</span>&gt; </a></div></div></div><div id='argument-argument' class='definition argument-definition'><span class='definiendum argument-definiendum'>&lt;<span class='title argument-title'>Argument</span>&gt;: </span><span class='argument-definiens definiens description'>Description</span></div></body></html>");
  });
  it("can export the argdown intro", function(){
    let source = fs.readFileSync("./test/intro.argdown", 'utf8');
    app.parse(source);
    let result = app.run(['preprocessor','export-html']);
    expect(result.lexerErrors).to.be.empty;
    expect(result.parserErrors).to.be.empty;
  });
  it("can create class names for tags", function(){
    let source = `Test #tag1
      + test #tag2
        - test #tag3`;
    app.parse(source);
    let result = app.run(['preprocessor','export-html']);
    expect(result.config.tags).to.exist;
    expect(Object.keys(result.config.tags).length).to.be.equal(3);
    expect(result.config.tags["tag1"].cssClassName).to.be.equal("tag-tag1");
    expect(result.config.tags["tag2"].cssClassName).to.be.equal("tag-tag2");
    expect(result.config.tags["tag3"].cssClassName).to.be.equal("tag-tag3");
  });  
});
