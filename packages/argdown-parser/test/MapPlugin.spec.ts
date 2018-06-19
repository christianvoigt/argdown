import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  MapPlugin,
  IMapResponse,
  IMapRequest,
  IGroupMapNode,
  RelationType,
  StatementSelectionMode
} from "../src/index";
import { toJSON } from "../src/model/toJSON";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
const modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin, "build-model");
const mapPlugin = new MapPlugin({ statementSelectionMode: StatementSelectionMode.ALL });
app.addPlugin(mapPlugin, "make-map");

describe("MapPlugin", function() {
  it("selects statement with title if statementSelectionMode is 'with-title'", function() {
    let source = `
        [S1]: test
            - [S2]: test

        Another Statement

        <A1>: Test

        (1) A
        (2) B
        ----
        (3) [S2]
    `;
    const request: IMapRequest = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: StatementSelectionMode.WITH_TITLE,
        excludeDisconnected: false
      }
    };
    let result: IMapResponse = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);
    const mapResponse = <IMapResponse>result;
    expect(mapResponse.map!.nodes.length).to.equal(3);
    expect(mapResponse.map!.nodes[0].title).to.equal("S1");
    expect(mapResponse.map!.nodes[0].labelTitle).to.equal("S1");
    expect(mapResponse.map!.nodes[0].labelText).to.equal("test");
    expect(mapResponse.map!.nodes[1].title).to.equal("S2");
    expect(mapResponse.map!.nodes[2].title).to.equal("A1");
  });
  it("selects top-level statement if statementSelectionMode is 'top-level'", function() {
    let source = `
        [S1]: test
            - [S2]: test

        <A>: Test

        (1) A
        (2) B
        ----
        (3) [S2]
    `;
    const request: IMapRequest = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: StatementSelectionMode.TOP_LEVEL,
        excludeDisconnected: false
      },
      logLevel: "error"
    };
    let result: IMapResponse = app.run(request);
    // console.log(toJSON(result.map!, null, 2));
    // console.log(toJSON(result.statements!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);
    const mapResponse = <IMapResponse>result;
    expect(mapResponse.map!.nodes.length).to.equal(2);
    expect(mapResponse.map!.nodes[0].title).to.equal("S1");
  });
  it("can create map from one statement and two argument definitions", function() {
    let source = `
    <Argument 1>
      + [Statement 1]: Hello World!
          + <Argument 2>: Description
    `;
    let result = app.run({
      process: ["parse-input", "build-model", "make-map"],
      input: source
    });
    //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);
    const mapResponse = <IMapResponse>result;
    expect(mapResponse.map!.nodes.length).to.equal(3);
    expect(mapResponse.map!.nodes[0].title).to.equal("Statement 1");
    expect(mapResponse.map!.nodes[1].title).to.equal("Argument 1");
    expect(mapResponse.map!.nodes[2].title).to.equal("Argument 2");
    expect(mapResponse.map!.edges.length).to.equal(2);
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
    let request: IMapRequest = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: StatementSelectionMode.WITH_RELATIONS
      }
    };
    let result = <IMapResponse>app.run(request);
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
    let request = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: "statement-trees"
      }
    };
    let result = <IMapResponse>app.run(request);
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
  it("selects argument if premises or conclusions are selected as statement nodes", function() {
    let source = `<!--Hier wird das Argument nicht richtig gezeichnet.-->

[ZT]: ZT

[T1]: T1

<Argument 1>: Argument 1.

(1) [T1]
(2) P2
-- Inference rule --
(3) [ZT]`;
    let request: IMapRequest = {
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: StatementSelectionMode.WITH_TITLE
      }
    };
    let result = <IMapResponse>app.run(request);

    expect(result.map!.nodes.length).to.equal(3);
    expect(result.map!.edges.length).to.equal(2);
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
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: StatementSelectionMode.TOP_LEVEL
      }
    };
    let result = <IMapResponse>app.run(request);
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
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: {
        statementSelectionMode: StatementSelectionMode.WITH_RELATIONS
      }
    };
    let result = <IMapResponse>app.run(request);
    //console.log(toJSON(result.map!, null, 2));
    expect(result.map!.edges.length).to.equal(3);
    expect(result.map!.nodes.length).to.equal(3);
  });
  it("can create groups from sections", function() {
    let source = `
# Section 1
  
  [A]: text
    + [B]
  
## Section 2
  
  [B]: text
    - <C>
  
### Section 3
  
  <C>: text
  
  `;
    let result = <IMapResponse>app.run({
      process: ["parse-input", "build-model", "make-map"],
      input: source
    });
    //console.log(toJSON(result.map!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.map!.nodes.length).to.equal(2);
    expect(result.map!.nodes[0].title).to.equal("A");
    expect(result.map!.nodes[1].title).to.equal("Section 2");
    expect(result.map!.edges.length).to.equal(2);

    let section2 = <IGroupMapNode>result.map!.nodes[1];
    expect(section2.children!.length).to.equal(2);
    expect(section2.children![0].title).to.equal("B");

    let section3 = <IGroupMapNode>section2.children![1];
    expect(section3.title).to.equal("Section 3");
    expect(section3.children!.length).to.equal(1);
    expect(section3.children![0].title).to.equal("C");
  });
  it("can create groups with only other groups as children", function() {
    let source = `
# Section 1

## Section 2

### Section 3

<A>: text
      - <B>: text
  
  `;
    let result = <IMapResponse>app.run(<IMapRequest>{
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      map: { statementSelectionMode: StatementSelectionMode.ALL }
    });
    //console.log(toJSON(result.map!.nodes, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    //console.log(result.arguments);

    expect(result.map!.nodes.length).to.equal(1);
    expect(result.map!.nodes[0].title).to.equal("Section 2");

    let section2 = <IGroupMapNode>result.map!.nodes[0];
    expect(section2.children!.length).to.equal(1);
    expect(section2.children![0].title).to.equal("Section 3");

    let section3 = <IGroupMapNode>section2.children![0];
    expect(section3.title).to.equal("Section 3");
    expect(section3.children!.length).to.equal(2);
    expect(section3.children![0].title).to.equal("A");
    expect(section3.children![1].title).to.equal("B");
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
    let result = <IMapResponse>app.run(<IMapRequest>{
      process: ["parse-input", "build-model", "make-map"],
      input: source,
      logLevel: "error",
      map: { statementSelectionMode: StatementSelectionMode.WITH_RELATIONS }
    });
    //console.log(toJSON(result.relations!, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);
    const d = result.statements!["D"];
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
});
