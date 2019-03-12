import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  DataPlugin,
  deriveImplicitRelations,
  RelationType,
  IConclusion,
  IInference
} from "../src/index";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");
const dataPlugin = new DataPlugin();
const modelPlugin = new ModelPlugin();
app.addPlugin(dataPlugin, "build-model");
app.addPlugin(modelPlugin, "build-model");

describe("deriveImplicitRelations", function() {
  it("does not derive implicit argument relation to pcs member", function() {
    let source = `
        [s1]: s1

        <a1>

        (1) sad
        ----
        (2) [s1]          
          `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    const implicitRelations = deriveImplicitRelations(
      result.arguments!["a1"],
      result.statements!,
      result.arguments!
    );
    expect(implicitRelations.length).to.be.equal(0);
  });
  it("can derive implicit relation of undercutting argument", function() {
    let source = `
        <a1>

        (1) sad
        ----
            <_ [s1]
        (2) asdas

        <a2>

        (1) asd
        ----
        (2) [s1]: asdas
          `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    const implicitRelations = deriveImplicitRelations(
      (<IConclusion>result.arguments!["a1"].pcs[1]).inference!,
      result.statements!,
      result.arguments!
    );
    expect(implicitRelations.length).to.be.equal(1);
    expect(implicitRelations[0].relationType).to.equal(RelationType.UNDERCUT);
    expect(implicitRelations[0].from!.title).to.equal("a2");
    expect((<IInference>implicitRelations[0].to!).argumentTitle).to.equal("a1");
  });
  it("can derive implicit undercut relation of argument", function() {
    let source = `
        <a1>

        (1) sad
        ----
            <_ [s1]       
            <_ <a3>
        (2) asdas

        <a2>

        (1) asd
        ----
        (2) [s1]: asdas
          `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    const implicitRelationsA1 = deriveImplicitRelations(
      result.arguments!["a1"],
      result.statements!,
      result.arguments!
    );
    expect(implicitRelationsA1.length).to.be.equal(3);
    expect(
      implicitRelationsA1.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.UNDERCUT
      )
    ).to.exist;
    expect(
      implicitRelationsA1.find(
        r =>
          r.from!.title === "s1" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.UNDERCUT
      )
    ).to.exist;
    expect(
      implicitRelationsA1.find(
        r =>
          r.from!.title === "a3" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.UNDERCUT
      )
    ).to.exist;

    const implicitRelationsA2 = deriveImplicitRelations(
      result.arguments!["a2"],
      result.statements!,
      result.arguments!
    );
    expect(implicitRelationsA2.length).to.be.equal(2);
    expect(
      implicitRelationsA2.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.UNDERCUT
      )
    ).to.exist;
    expect(
      implicitRelationsA2.find(
        r =>
          r.from!.title === "a2" &&
          (<IInference>r.to!).argumentTitle === "a1" &&
          (<IInference>r.to!).conclusionIndex === 1 &&
          r.relationType === RelationType.UNDERCUT
      )
    ).to.exist;
    const implicitRelationsA3 = deriveImplicitRelations(
      result.arguments!["a3"],
      result.statements!,
      result.arguments!
    );
    expect(implicitRelationsA3.length).to.be.equal(1);
    expect(
      implicitRelationsA3.find(
        r =>
          r.from!.title === "a3" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.UNDERCUT
      )
    ).to.exist;
  });
  it("can derive implicit relations of statement", function() {
    let source = `
===
model:
    mode: strict
===

    [s1]: s
        - [s2]: s
        -> [s3]: s
        <- [s4]: s
    
    <a1>
    
    (1) [s1]
    ----
    (2) s
    
    <a2>
    
    (1) s
    ----
    (2) [s2]

    <a3>

    (1) s
    ----
    (2) [s1]

    <a4>

    (1) [s3]
    ----
    (2) s

    <a5>

    (1) [s4]
    ----
    (2) s
      
      `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    const implicitRelations = deriveImplicitRelations(
      result.statements!["s1"],
      result.statements!,
      result.arguments!
    );
    expect(implicitRelations.length).to.equal(5);
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "s1" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "s1" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.SUPPORT
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a3" &&
          r.to!.title === "s1" &&
          r.relationType === RelationType.SUPPORT
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "s1" &&
          r.to!.title === "a4" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "s1" &&
          r.to!.title === "a5" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
  });
  it("can derive implicit relations of argument", function() {
    let source = `
===
model:
    mode: strict
===

[s1]: s
    - [s2]: s

[s3]: s
    - [s4]: s
    -> [s5]: s // symmetric
    +> [s6]: s // outgoing
    -> <a3> // outgoing & explicit
    <- <a4> 

<a1>

(1) [s1]
----
(2) s

<a2>

(1) [s3]
----
(2) [s2]
    <- [s7] // symmetric
    <+ [s8] // incoming
    <- <a5> // incoming & explicit
    -> <a6> 
  
  `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    const implicitRelations = deriveImplicitRelations(
      result.arguments!["a2"],
      result.statements!,
      result.arguments!
    );
    expect(implicitRelations.length).to.equal(7);
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "s1" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "a1" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "s4" &&
          r.to!.title === "a2" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "s5" &&
          r.to!.title === "a2" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a4" &&
          r.to!.title === "a2" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "s7" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
    expect(
      implicitRelations.find(
        r =>
          r.from!.title === "a2" &&
          r.to!.title === "a6" &&
          r.relationType === RelationType.ATTACK
      )
    ).to.exist;
  });
});
