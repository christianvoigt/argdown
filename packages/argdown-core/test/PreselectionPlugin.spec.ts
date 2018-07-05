import { expect } from "chai";
import { ArgdownApplication, ParserPlugin, ModelPlugin, DataPlugin, PreselectionPlugin } from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
const preselectionPlugin = new PreselectionPlugin();
app.addPlugin(preselectionPlugin, "build-map");

describe("PreselectionPlugin", function() {
  it("preselects only statements and arguments with the #core tag.", function() {
    let source = `
    ===
    title: Preselecting only statements and arguments with the #core tag.
    selection:
        selectedTags:
            - core
    ===
    
    [t1] #core
        + <a> #core
            - <b>
        - <c> #core
            - <d>
                + <e>
    
    <f>
        + [t1]
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(1);
    expect(result.selection!.arguments.length).to.equal(2);
  });
  it("preselects only statements and arguments without tag or with the #pro tag.", function() {
    let source = `
    ===
    title: > 
        Preselecting only statements and arguments without tag or with the #pro tag.
    selection:
        selectedTags:
            - pro
        selectElementsWithoutTag: true
    ===
    
    [t1] #core #pro
        + <a> #pro #core
            - <b> #con
        - <c> #core
            - <d> #con
                + <e> #pro
    
    <f>
        + [t1]
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(1);
    expect(result.selection!.statements.find(s => s.title === "t1")).to.exist;
    expect(result.selection!.arguments.length).to.equal(3); // excludeDisconnected will only be applied in the selection round.
    expect(result.selection!.arguments.find(a => a.title === "a")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "f")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "e")).to.exist;
  });
  it("preselects only statements and arguments within the section H1", function() {
    let source = `
    ===
    title: >
        Preselecting only statements and arguments within the section H1
    selection:
        selectedSections:
            - H1
    ===
    
    [t1]: text
        + <a>
        - <b>
    
    # H1
    
    <a>: argument description
        + <c>: argument description
        - <d>: argument description
    
    # H2
    
    <b>: argument description
        + <e>: argument description
        - <f>: argument description
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(0);
    expect(result.selection!.arguments.length).to.equal(3); // excludeDisconnected will only be applied in the selection round.
    expect(result.selection!.arguments.find(a => a.title === "a")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "d")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "c")).to.exist;
  });
  it("preselects only statements and arguments within the section H1 or without any section", function() {
    let source = `
    ===
    title: >
        Preselecting only statements and arguments within the section H1 or without any section
    selection:
        selectedSections:
            - H1
        selectElementsWithoutSection: true
    ===
    
    [t1]: text
        + <a>
        - <b>
    
    # H1
    
    <a>: argument description
        + <c>: argument description
        - <d>: argument description
    
    # H2
    
    <b>: argument description
        + <e>: argument description
        - <f>: argument description
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(1);
    expect(result.selection!.statements.find(s => s.title === "t1")).to.exist;
    expect(result.selection!.arguments.length).to.equal(3); // excludeDisconnected will only be applied in the selection round.
    expect(result.selection!.arguments.find(a => a.title === "a")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "d")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "c")).to.exist;
  });
  it("icludes and excludes elements by title", function() {
    let source = `
    ===
    title: Including and excluding elements by title
    selection:
        includeStatements:
            - t1
            - t2
        excludeStatements:
            - t3
        excludeArguments:
            - b
            - c
    ===
    
    <a>
    
    (1) [t1]: s1
    (2) [t2]: s2
    ----
    (3) [t3]: s3
    
    [t3]: s3
        - <b>
    
    <a>
        - <c>
        + <d>
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(2);
    expect(result.selection!.statements.find(s => s.title === "t1")).to.exist;
    expect(result.selection!.statements.find(s => s.title === "t2")).to.exist;
    expect(result.selection!.arguments.length).to.equal(2); // excludeDisconnected will only be applied in the selection round.
    expect(result.selection!.arguments.find(a => a.title === "a")).to.exist;
    expect(result.selection!.arguments.find(a => a.title === "d")).to.exist;
  });
  it("excludes nodes with the isInMap flag false", function() {
    let source = `
    <a>

    (1) s1 {isInMap: false}
    (2) s2
    ----
    (3) s3 {isInMap: false}
    
    <b> {isInMap: false}
        - <a>
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(1);
    expect(result.selection!.statements.find(s => s.members[0].text === "s2")).to.exist;
    expect(result.selection!.arguments.length).to.equal(1); // excludeDisconnected will only be applied in the selection round.
    expect(result.selection!.arguments.find(a => a.title === "a")).to.exist;
  });
  it("can ignore isInMap flags", function() {
    let source = `
    ===
    title: Ignoring isInMap flags
    selection:
        ignoreIsInMap: true
        statementSelectionMode: not-used-in-argument
    ===
    
    <a>
    
    (1) s1 {isInMap: false}
    (2) s2
    ----
    (3) s3 {isInMap: false}
    
    <b> {isInMap: false}
        - <a>
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.arguments.length).to.equal(2);
  });
});
