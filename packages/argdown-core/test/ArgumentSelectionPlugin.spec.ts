import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  DataPlugin,
  PreselectionPlugin,
  ArgumentSelectionPlugin
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
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
app.addPlugin(argumentSelectionPlugin, "build-map");

describe("ArgumentSelectionPlugin", function() {
  it("can exclude disconnected nodes.", function() {
    let source = `
        ===
        title: Including disconnected nodes
        selection:
            excludeDisconnected: true
        ===
        
        <a>: I am currently in no relation.
        
        <b>: It's complicated.
        
        <c>: I feel disconnected.
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
    
    <a>: I am currently in no relation.
    
    <b>: It's complicated.
    
    <c>: I feel disconnected.
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(0);
    expect(result.selection!.arguments.length).to.equal(3);
  });
  it("can include nodes connected by undercut.", function() {
    let source = `    
    <a>

    (1) s1
    (2) s2
    ----
        <_ <b>
    (3) s3
    (4) s4
    ----
    (5) s3
        <_ <c>

    <d>: not included

    <e>
        _> <f>
        <_ <g>
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(5);
    expect(result.selection!.arguments.length).to.equal(6);
  });
  it("can include nodes connected by support and attack.", function() {
    let source = `    
    <a>

    (1) s1 {isInMap: false}
        +> <i>
        -> <j>
    (2) s2
        <- <b>
    ----
    (3) s3 {isInMap: false}
        <+ <k>
        <- <l>
    (4) s4
        <+ <c>
    ----
    (5) s3
        +> <d>
        -> <e>

    <f>: not included

    <a>
        - <g>
        + <h>
    `;
    const request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source
    };
    let result = app.run(request);
    expect(result.selection!.statements.length).to.equal(3);
    expect(result.selection!.arguments.length).to.equal(7);
  });
});
