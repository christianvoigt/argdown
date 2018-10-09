import { expect } from "chai";
import { ArgdownApplication, ParserPlugin, ModelPlugin } from "@argdown/core";
import { DocumentSymbolPlugin } from "../src/providers/DocumentSymbolPlugin";

let app = new ArgdownApplication();

describe("DocumentSymbolPlugin", function() {
  const parserPlugin = new ParserPlugin();
  const modelPlugin = new ModelPlugin();
  const documentSymbolPlugin = new DocumentSymbolPlugin();
  app.addPlugin(parserPlugin, "parse-input");
  app.addPlugin(modelPlugin, "build-model");
  app.addPlugin(documentSymbolPlugin, "export-symbols");
  it("sanity test", function() {
    const source = `[T1]: Hello World`;
    const result = app.run({
      process: ["parse-input", "build-model", "export-symbols"],
      input: source,
      logLevel: "error"
    });
    expect(result.documentSymbols).to.exist;
    expect(result.documentSymbols!.length).to.equal(1);
    expect(result.documentSymbols![0].name).to.equal("[T1]");
  });
  it("can create document symbols for relations", function() {
    const source = `
A
  - B
    +> C`;
    const result = app.run({
      process: ["parse-input", "build-model", "export-symbols"],
      input: source,
      logLevel: "error"
    });
    //console.log(JSON.stringify(result.documentSymbols, null, 2));
    expect(result.documentSymbols).to.exist;
    expect(result.documentSymbols!.length).to.equal(1);
    expect(result.documentSymbols![0].name).to.equal("[Untitled 1]");
  });
  it("can create list of document symbols for headings, statements, arguments, relations and pcss", function() {
    const source = `
    # Heading 1

    Hello Earth!

    [S1]: Hello _World_!

    ## Heading 1.2
    
    <A1>: Just because.
      - <A2>: Basta.

    # Heading 2
      
    <A1>
    
    (1) A
    (2) B
    ----
    (3) C`;
    const result = app.run({
      process: ["parse-input", "build-model", "export-symbols"],
      input: source,
      logLevel: "error"
    });
    // console.log(astToString(result.ast!));
    //console.log(JSON.stringify(result.documentSymbols, null, 2));
    expect(result.documentSymbols).to.exist;
    expect(result.documentSymbols!.length).to.equal(2);
    expect(result.documentSymbols![0].name).to.equal("# Heading 1");
    expect(result.documentSymbols![0].children![0].name).to.equal("[Untitled 1]");
    expect(result.documentSymbols![0].children![1].name).to.equal("[S1]");
    expect(result.documentSymbols![0].children![2].name).to.equal("## Heading 1.2");
    expect(result.documentSymbols![0].children![2].children![0].name).to.equal("<A1>");
    expect(result.documentSymbols![0].children![2].children![0].children![0].name).to.equal("<- <A2>");
    expect(result.documentSymbols![1].name).to.equal("# Heading 2");
    expect(result.documentSymbols![1].children![0].name).to.equal("<A1>");
    expect(result.documentSymbols![1].children![1].name).to.equal("PCS <A1>");
    expect(result.documentSymbols![1].children![1].children![0].name).to.equal("(1) [Untitled 2]");
    expect(result.documentSymbols![1].children![1].children![1].name).to.equal("(2) [Untitled 3]");
    expect(result.documentSymbols![1].children![1].children![2].name).to.equal("----");
    expect(result.documentSymbols![1].children![1].children![3].name).to.equal("(3) [Untitled 4]");
  });
});
