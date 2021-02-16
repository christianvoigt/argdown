import { expect } from "chai";
import {it} from "mocha";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  ColorPlugin,
  HtmlExportPlugin
} from "../src/index";
import * as fs from "fs";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const modelPlugin = new ModelPlugin();
const colorPlugin = new ColorPlugin();
app.addPlugin(parserPlugin, "parse-input");
app.addPlugin(modelPlugin, "build-model");
app.addPlugin(colorPlugin, "build-model");

describe("HtmlExport", function() {
  let htmlExport = new HtmlExportPlugin();
  app.addPlugin(htmlExport, "export-html");
  it("can export Argdown", function() {
    const input = `# Title
      
    [Statement]: Hello World!
      +<Argument>
      
    <Argument>: Description 1 < 2`;
    let request = {
      process: ["parse-input", "build-model", "export-html"],
      input
    };
    let result = app.run(request);
    // console.log(result.html);
    expect(result.html).to.equal(
      `<!doctype html><html lang="en"><head><meta charset="utf8"><title>Title</title><link rel="stylesheet" href="./argdown.css"></head><body><div class="argdown"><h1 data-line="1" id="heading-title" class="has-line heading"><span class="statement-content">Title</span></h1><div data-line="3" class="statement has-line top-level"><span id="statement-statement" class="definition statement-definition definiendum top-level">[<span class="title statement-title">Statement</span>]: </span><span class="statement-content top-level">Hello World!</span><div class="relations"><div data-line="4" class="has-line outgoing support relation"><div class="outgoing support relation-symbol"><span>+</span></div><div data-line="4" class="argument has-line"><a id="" href="#argument-argument" data-line="4" class="has-line reference argument-reference">&lt;<span class="title argument-title">Argument</span>&gt; </a></div></div></div></div><div data-line="6" class="argument has-line top-level"><a id="argument-argument" href="#argument-argument" class="definition argument-definition definiendum top-level">&lt;<span class="title argument-title">Argument</span>&gt;: </a><span class="statement-content top-level">Description 1 &lt; 2</span></div></div></body></html>`
    );
  });
  it("can export the argdown intro", function() {
    let source = fs.readFileSync("./test/intro.argdown", "utf8");
    let result = app.run({
      process: ["parse-input", "build-model", "export-html"],
      input: source
    });
    expect(result.lexerErrors).to.be.empty;
    expect(result.parserErrors).to.be.empty;
  });
  it("can export titles with ranges", function() {
    let source = `# title _italic_ **bold**`;
    let result = app.run({
      process: ["parse-input", "build-model", "export-html"],
      input: source,
      html: { headless: true }
    });
    // console.log(result.html);
    expect(result.html).to.equal(
      `<div class="argdown"><h1 data-line="1" id="heading-title-italic-bold" class="has-line heading"><span class="statement-content">title <i><span class="statement-content">italic</span></i> <b><span class="statement-content">bold</span></b></span></h1></div>`
    );
  });
});
