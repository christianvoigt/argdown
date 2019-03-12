import { expect } from "chai";
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
      `<!doctype html><html lang="en"><head><meta charset="utf8"><title>Title</title><link rel="stylesheet" href="./argdown.css"></head><body><div class="argdown"><h1 data-line="1" id="heading-title" class="has-line heading">Title</h1><div data-line="3" class="statement has-line"><span id="statement-statement" class="definition statement-definition definiendum">[<span class="title statement-title">Statement</span>]: </span>Hello World!<div class="relations"><div data-line="4" class="has-line outgoing support relation"><div class="outgoing support relation-symbol"><span>+</span></div><div data-line="4" class="argument has-line"><a id="" href="#argument-argument" data-line="4" class="has-line reference argument-reference">&lt;<span class="title argument-title">Argument</span>&gt; </a></div></div></div></div><div data-line="6" class="argument has-line"><a id="argument-argument" href="#argument-argument" class="definition argument-definition definiendum">&lt;<span class="title argument-title">Argument</span>&gt;: </a>Description 1 &lt; 2</div></div></body></html>`
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
    expect(result.html).to.equal(
      `<div class="argdown"><h1 data-line="1" id="heading-title-italic-bold" class="has-line heading">title <i>italic</i> <b>bold</b></h1></div>`
    );
  });
});
