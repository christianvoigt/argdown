import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  DataPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
const dataPlugin = new DataPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");
const preselectionPlugin = new PreselectionPlugin();
app.addPlugin(preselectionPlugin, "build-map");
const statementSelectionPlugin = new StatementSelectionPlugin();
app.addPlugin(statementSelectionPlugin, "build-map");

describe("StatementSelectionPlugin", function() {
  it("can exclude disconnected nodes.", function() {
    let source = `
        ===
        title: Including disconnected nodes
        selection:
            excludeDisconnected: true
        ===
        
        [a]: I am currently in no relation.
        
        [b]: It's complicated.
        
        [c]: I feel disconnected.
        `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(0);
    expect(result.selection!.arguments.length).to.equal(0);
  });
  it("can include disconnected nodes.", function() {
    let source = `
    ===
    title: Including disconnected nodes
    selection:
        excludeDisconnected: false
    ===
    
    [a]: I am currently in no relation.
    
    [b]: It's complicated.
    
    [c]: I feel disconnected.
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.arguments.length).to.equal(0);
  });
  it("can include nodes connected by logical relations.", function() {
    let source = `    
    [s1]
        - [s2]
        + [s3]
        >< [s4]

    [s5]
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(4);
    expect(result.selection!.arguments.length).to.equal(0);
  });
  it("can include statements connected to pcs statements.", function() {
    let source = `

    (1) s1
        >< s4
    (2) s2
        + s5
    ----
    (3) s3
        - s6

    [s5]
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.arguments.length).to.equal(1);
  });
  it("can include statements connected to arguments.", function() {
    let source = `

<a>
    <- s1
    <+ s2
    <_ s3
    -> s4
    +> s5

[s5]
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(5);
    expect(result.selection!.arguments.length).to.equal(1);
  });
  it("includes all statements in 'all' mode.", function() {
    let source = `
    ===
    selection:
        statementSelectionMode: all
    ===

    <a>
    
    (1) [title]: I am selected
    (2) I am selected
    ----
    (3) I am selected
        -> I am selected
            + <b>
    
    <a>
        - I am selected
    
    [another title]: not very exciting, isn't it? // not selected
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(5);
    expect(result.selection!.arguments.length).to.equal(2);
  });
  it("includes all statements not used in argument in 'not-used-in-argument' mode.", function() {
    let source = `
    ===
    selection:
        statementSelectionMode: not-used-in-argument
    ===
    <a>
    
    (1) [title]: I am not selected
    (2) I am not selected
    ----
    (3) I am not selected
        -> I am selected
            + <b>
    
    <a>
        - I am selected
    
    [another title]: I am not selected
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(2);
    expect(result.selection!.arguments.length).to.equal(2);
  });
  it("includes all statements with title in 'with-title' mode.", function() {
    let source = `
    ===
    selection:
        statementSelectionMode: with-title
    ===
    <a>
    
    (1) [title]: I am selected
    (2) I am not selected
    ----
    (3) I am not selected
        -> I am selected
    
    <a>
        - I am selected
            + <b>
    
    [another title]: slightly more interesting. // still not selected
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.arguments.length).to.equal(2);
  });
  it("includes all statements with relations in 'with-relation' mode.", function() {
    let source = `
    ===
    selection:
        statementSelectionMode: with-relations
    ===
    <a>
    
    (1) [title]: I am not selected
    (2) I am not selected
    ----
    (3) I am selected
        -> I am selected
    
    <a>
        - I am selected
            + <b>
    
    [another title]: still not selected
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.arguments.length).to.equal(2);
  });
  it("includes all statements with more than 1 relation in 'with-more-than-one-relation' mode.", function() {
    let source = `
    ===
    selection:
        statementSelectionMode: with-more-than-one-relation
    ===
    <a>
    
    (1) [title]: I am not selected
    (2) I am not selected
    ----
    (3) I am not selected
        -> I am selected
    
    <a>
        - I am selected
            + <b>
    
    [another title]: still not selected
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(2);
    expect(result.selection!.arguments.length).to.equal(2);
  });
  it("selects top-level statement if statementSelectionMode is 'top-level'", function() {
    let source = `
    ===
    selection:
        statementSelectionMode: top-level
    ===
    <a>
    
    (1) [title]: I am not selected
    (2) I am not selected
    ----
    (3) I am not selected
        -> I am selected
    
    <a>
        - I am selected
            + <b>
        + [another title]
    
    [another title]: finally!
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      logLevel: "error"
    };
    let result = app.run(request);

    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.statements.find(s => s.title! === "another title")).to.exist;
    expect(result.selection!.arguments.length).to.equal(2);
  });
});
