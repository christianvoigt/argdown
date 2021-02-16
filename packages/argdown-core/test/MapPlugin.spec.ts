import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  RelationType,
  StatementSelectionMode,
  IArgdownRequest,
  DataPlugin,
  PreselectionPlugin,
  ArgumentSelectionPlugin,
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
const statementSelectionPlugin = new StatementSelectionPlugin({
  statementSelectionMode: StatementSelectionMode.ALL
});
app.addPlugin(statementSelectionPlugin, "build-map");
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
app.addPlugin(argumentSelectionPlugin, "build-map");
const mapPlugin = new MapPlugin();
app.addPlugin(mapPlugin, "build-map");

describe("MapPlugin", function() {
  it("can create map from one statement and two argument definitions", function() {
    let source = `
    <Argument 1>
      + [Statement 1]: Hello World!
          + <Argument 2>: Description
    `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source
    });
    //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.map!.nodes.length).to.equal(3);
    expect(result.map!.nodes[0].title).to.equal("Statement 1");
    expect(result.map!.nodes[1].title).to.equal("Argument 1");
    expect(result.map!.nodes[2].title).to.equal("Argument 2");
    expect(result.map!.edges.length).to.equal(2);
  });
  it("can create a map from two argument reconstructions", function() {
    let source = `<Argument 1>

(1)[Statement 1]: A
(2)[Statement 2]: B
----
(3)[Statement 3]: C

<Argument 2>

(1)[Statement 4]: A
(2)[Statement 5]: B
----
(3)[Statement 6]: C
    ->[Statement 1]`;
    let request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      selection: {
        statementSelectionMode: StatementSelectionMode.WITH_RELATIONS
      }
    };
    let result = app.run(request);
    //console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.map.edges);

    expect(result.map!.nodes.length).to.equal(4);
    expect(result.map!.edges.length).to.equal(3);

    expect(result.map!.edges[0].relationType).to.equals(RelationType.ATTACK);
    expect(result.map!.edges[0].from.title).to.equals("Statement 6");
    expect(result.map!.edges[0].to.title).to.equals("Statement 1");

    expect(result.map!.edges[1].relationType).to.equals(RelationType.SUPPORT);
    expect(result.map!.edges[1].from.title).to.equals("Argument 2");
    expect(result.map!.edges[1].to.title).to.equals("Statement 6");

    expect(result.map!.edges[2].relationType).to.equals(RelationType.SUPPORT);
    expect(result.map!.edges[2].from.title).to.equals("Statement 1");
    expect(result.map!.edges[2].to.title).to.equals("Argument 1");
  });
  it("adds arguments a, b and support to map if a's conclusion is b's premise ", function() {
    let source = `<Argument 1>

(1)[Statement 1]: A
(2)[Statement 2]: B
----
(3)[Statement 3]: C

<Argument 2>

(1)[Statement 3]: A
(2)[Statement 4]: B
----
(3)[Statement 5]: C`;
    let request: IArgdownRequest = {
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      selection: {
        statementSelectionMode: StatementSelectionMode.NOT_USED_IN_ARGUMENT
      }
    };
    let result = app.run(request);
    // console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.map.edges);

    expect(result.map!.nodes.length).to.equal(2);
    expect(result.map!.edges.length).to.equal(1);

    expect(result.map!.edges[0].relationType).to.equals(RelationType.SUPPORT);
    expect(result.map!.edges[0].from.title).to.equals("Argument 1");
    expect(result.map!.edges[0].to.title).to.equals("Argument 2");
  });
  it("adds attack edges if statement is contradictory to premise", function() {
    let source = `
[T1]: T1

[T2]: T2

(1) P1
  >< [T1]
(2) P2
----
(3) C1 
  >< [T2]`;
    let request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      selection: {
        statementSelectionMode: StatementSelectionMode.TOP_LEVEL
      }
    };
    let result = app.run(request);
    //console.log(result.map!.nodes);
    // console.log(result.relations);
    // console.log(result.map!.edges);
    expect(result.map!.nodes.length).to.equal(3);
    expect(result.map!.edges.length).to.equal(2);
  });
  it("does not add duplicate arrows for contradictions", function() {
    let source = `<A>

(1) A
----
(2) [T1]: C
  >< [T2]: B

`;
    let request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      selection: {
        statementSelectionMode: StatementSelectionMode.WITH_RELATIONS
      }
    };
    let result = app.run(request);
    //console.log(toJSON(result.map!, null, 2));
    expect(result.map!.edges.length).to.equal(2);
    expect(result.map!.nodes.length).to.equal(3);
  });
  it("can create edges from undercuts", function() {
    let source = `
<A>: text
    <_ [B]: text

<C>

(1) text
(2) text
----
    <_ [D]: text
(3) text

<E>

(1) text
(2) text
----
(3) text
    <_ <Z>
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      logLevel: "error",
      selection: {
        statementSelectionMode: StatementSelectionMode.WITH_RELATIONS
      }
    });
    //console.log(toJSON(result.relations!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    // const d = result.statements!["D"];
    // for (let relation of d.relations!) {
    //   console.log(relation.toString());
    // }
    // for (let relation of result.relations!) {
    //   console.log(relation.toString());
    // }
    // for (let edge of result.map!.edges) {
    //   console.log(edge.toString());
    // }
    expect(result.map!.edges.length).to.equal(3);
    // expect(result.map!.nodes[0].title).to.equal("Section 2");

    // let section2 = result.map!.nodes[0];
    // expect(section2.children!.length).to.equal(1);
    // expect(section2.children![0].title).to.equal("Section 3");

    // let section3 = section2.children![0];
    // expect(section3.title).to.equal("Section 3");
    // expect(section3.children!.length).to.equal(2);
    // expect(section3.children![0].title).to.equal("A");
    // expect(section3.children![1].title).to.equal("B");
  });
  it("does not add duplicate arrows for contradictions", function() {
    let source = `<A>

(1) A
----
(2) [T1]: C
  >< [T2]: B

`;
    let request = {
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      selection: {
        statementSelectionMode: StatementSelectionMode.WITH_RELATIONS
      }
    };
    let result = app.run(request);
    //console.log(toJSON(result.map!, null, 2));
    expect(result.map!.edges.length).to.equal(2);
    expect(result.map!.nodes.length).to.equal(3);
  });
  it("does not add c2c attacks in strict mode", function() {
    let source = `
    ===
    model:
        mode: strict 
    selection:
      statementSelectionMode: not-used-in-argument
    ===
    
    
    <A>
      
    (1) [t]: T {isInMap: false}
    ----
    (2) C
    
    <B>
      
    (1) P
    ----
    (2) [t]: T {isInMap: false}
    
    <C>
    
    (1) P
    ----
    (2) non-T
      - [t]
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      logLevel: "error"
    });
    expect(result.map!.edges.length).to.equal(2);
  });
  it("does not add redundant edges from equivalence classes", function() {
    let source = `
===
model:
    mode: strict 
selection:
  statementSelectionMode: not-used-in-argument
===

<Test 1>
+> <Test 2>
 
 <Test 1>
 
 (1) Premise
 ----
 (2) [Conclusion 2]
 
 <Test 2>
 
 (1) [Conclusion 2]
 ----
 (2) Conclusion
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      logLevel: "error"
    });
    expect(result.map!.edges.length).to.equal(1);
  });
  it("does not add redundant edges from ec2ec contrary and ec2a attack relations", function() {
    let source = `
  ===
  selection:
    statementSelectionMode: not-used-in-argument
  ===
  
  [A]
    - [B]
    
  <a1>
  
  (1) asdsa
  (2) asdasdas
  -----
  (3) [B]
    -> <a2>
  
  
  <a2>
  
  (1) [A]
  (2) asdasd
  ----
  (3) sadsd
    
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      logLevel: "error"
    });
    expect(result.map!.edges.length).to.equal(1);
  });
it("can create labels without text", function() {
    let source = `
===
selection:
  statementSelectionMode: all
  excludeDisconnected: false
map:
  statementLabelMode: none
  argumentLabelMode: none
===
  
<An argument title>

[A statement title]
    
  `;
    let result = app.run({
      process: ["parse-input", "build-model", "build-map"],
      input: source,
      logLevel: "error"
    });
    expect(result.map!.nodes.length).to.equal(2);
    expect(result.map!.nodes[0].labelText).to.not.exist;
    expect(result.map!.nodes[0].labelTitle).to.not.exist;
    expect(result.map!.nodes[1].labelText).to.not.exist;
    expect(result.map!.nodes[1].labelTitle).to.not.exist;
  });
});
