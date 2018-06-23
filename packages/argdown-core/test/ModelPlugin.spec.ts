import { expect } from "chai";
import {
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  IRelation,
  IConclusion,
  IAstNode,
  RelationType,
  ArgdownTypes,
  StatementRole,
  IEquivalenceClass,
  IArgument
} from "../src/index";
import * as fs from "fs";

let app = new ArgdownApplication();

describe("ModelPlugin", function() {
  const parserPlugin = new ParserPlugin();
  let modelPlugin = new ModelPlugin();
  app.addPlugin(parserPlugin, "parse-input");
  app.addPlugin(modelPlugin, "build-model");

  it("can create statements dictionary and save statement by title", function() {
    const source = `
    [Test]: Hello Earth!

    [Test]: Hello _World_!`;
    const result = app.run({
      process: ["parse-input", "build-model"],
      input: source,
      logLevel: "error"
    });
    const statements = result.statements!;
    expect(statements).to.exist;
    expect(statements["Test"]).to.exist;
    expect(statements["Test"].isUsedAsTopLevelStatement).to.be.true;
    expect(statements["Test"].members[0].text).to.equal("Hello Earth!");
    expect(statements["Test"].members[0].role).to.equal(
      StatementRole.TOP_LEVEL_STATEMENT
    );
    expect(statements["Test"].members[1].text).to.equal("Hello World!");
    expect(statements["Test"].members[1].role).to.equal(
      StatementRole.TOP_LEVEL_STATEMENT
    );
    expect(
      IEquivalenceClass.getCanonicalMember(statements["Test"])!.text
    ).to.equal("Hello World!");
    expect(
      IEquivalenceClass.getCanonicalMemberText(statements["Test"])
    ).to.equal("Hello World!");
    expect(statements["Test"].members[1].ranges!.length).to.equal(1);
    expect(statements["Test"].members[1].ranges![0].type).to.equal("italic");
    expect(statements["Test"].members[1].ranges![0].start).to.equal(6);
    expect(statements["Test"].members[1].ranges![0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function() {
    let source = `
    <Test>: Hello Earth!

    <Test>: Hello _World_!`;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.arguments!["Test"]).to.exist;
    expect(result.arguments!["Test"].descriptions.length).to.equal(2);
    let description = result.arguments!["Test"].descriptions[1];
    expect(
      IArgument.getCanonicalDescription(result.arguments!["Test"])
    ).to.equal(description);
    expect(
      IArgument.getCanonicalDescriptionText(result.arguments!["Test"])
    ).to.equal(description.text);
    expect(description.text).to.equal("Hello World!");
    expect(description.ranges!.length).to.equal(1);
    expect(description.ranges![0].type).to.equal("italic");
    expect(description.ranges![0].start).to.equal(6);
    expect(description.ranges![0].stop).to.equal(10);
  });
  it("can create statement relations and ignore duplicates", function() {
    let source = `
    [A]: The Beatles are the best!
      + [B]: The Beatles made 'Rubber Soul'!
      -> <C>: The Rolling Stones were cooler!
        
    [A]
      + [B]
      -> <C>
    `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });

    expect(Object.keys(result.statements!).length).to.equal(2);
    expect(Object.keys(result.arguments!).length).to.equal(1);
    expect(result.relations!.length).to.equal(2);

    expect(result.statements!["A"]).to.exist;
    expect(result.statements!["A"].isUsedAsTopLevelStatement).to.equal(true);
    expect(!!result.statements!["A"].isUsedAsRelationStatement).to.equal(false);
    expect(result.statements!["A"].relations!.length).to.equal(2);
    expect(result.statements!["A"].relations![0].relationType).to.equal(
      RelationType.ENTAILS
    );
    expect(result.statements!["A"].relations![0].to).to.equal(
      result.statements!["A"]
    );
    expect(result.statements!["A"].relations![0].from).to.equal(
      result.statements!["B"]
    );
    expect(result.statements!["B"]).to.exist;
    expect(!!result.statements!["B"].isUsedAsTopLevelStatement).to.equal(false);
    expect(result.statements!["B"].isUsedAsRelationStatement).to.equal(true);
    expect(result.statements!["B"].relations!.length).to.equal(1);
    expect(result.arguments!["C"]).to.exist;
    expect(result.arguments!["C"].relations!.length).to.equal(1);
    expect(result.arguments!["C"].relations![0].relationType).to.equal(
      RelationType.ATTACK
    );
    expect(result.arguments!["C"].relations![0].from).to.equal(
      result.statements!["A"]
    );
    expect(result.arguments!["C"].relations![0].to).to.equal(
      result.arguments!["C"]
    );
  });
  it("can ignore duplicates of argument relations", function() {
    let source = `
    [A]: text
      + <Argument 1>
    
    <Argument 1>
    
    (1) text
    (2) text
    ----
    (3) [B]: text
      +> [A]
    `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(Object.keys(result.statements!).length).to.equal(4);
    expect(Object.keys(result.arguments!).length).to.equal(1);
    expect(result.relations!.length).to.equal(1);
  });
  it("can create sketched argument relations", function() {
    let source =
      "<A>: The Beatles are the best!\n  +<B>: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.arguments!["A"]).to.exist;
    expect(result.arguments!["A"].relations!.length).to.equal(2);
    expect(result.arguments!["A"].relations![0].relationType).to.equal(
      RelationType.SUPPORT
    );
    expect(result.arguments!["A"].relations![0].to).to.equal(
      result.arguments!["A"]
    );
    expect(result.arguments!["A"].relations![0].from).to.equal(
      result.arguments!["B"]
    );
    expect(result.arguments!["B"]).to.exist;
    expect(result.arguments!["B"].relations!.length).to.equal(1);
    expect(result.statements!["C"]).to.exist;
    expect(result.statements!["C"].relations!.length).to.equal(1);
    expect(result.statements!["C"].relations![0].relationType).to.equal(
      RelationType.ATTACK
    );
    expect(result.statements!["C"].relations![0].from).to.equal(
      result.arguments!["A"]
    );
    expect(result.statements!["C"].relations![0].to).to.equal(
      result.statements!["C"]
    );
  });
  it("does not create duplicate relations for contradictions", function() {
    let source = `[A]: A
      >< [B]: B
    
    [B]
      >< [A]`;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.parserErrors!.length).to.equal(0);
    expect(Object.keys(result.statements!).length).to.equal(2);
    expect(Object.keys(result.relations!).length).to.equal(1);
  });
  it("can parse undercuts", function() {
    let source = `[A]: A
      _> <B>
    
    <B>
      <_ [D]`;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    //console.log(parserPlugin.parser.astToString(result.ast));
    //console.log(result.parserErrors[0]);
    expect(result.parserErrors!.length).to.equal(0);
    expect(Object.keys(result.statements!).length).to.equal(2);
    expect(Object.keys(result.relations!).length).to.equal(2);
    expect(result.relations![0].relationType!).to.equal(RelationType.UNDERCUT);
    expect(result.relations![0].from!.title).to.equal("A");
    expect(result.relations![0].to!.title).to.equal("B");
    expect(result.relations![1].relationType!).to.equal(RelationType.UNDERCUT);
    expect(result.relations![1].from!.title).to.equal("D");
    expect(result.relations![1].to!.title).to.equal("B");
  });
  it("can process a single argument", function() {
    let source = "(1) [s1]: A\n(2) [s2]: B\n----\n(3) [s3]: C";
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.arguments!["Untitled 1"]).to.exist;
    expect(result.statements!["s1"]).to.exist;
    expect(result.statements!["s2"]).to.exist;
    expect(result.statements!["s3"]).to.exist;
  });

  it("can create premise conclusion structures", function() {
    let source = `
  <Reconstructed Argument>
  
  (1) [A]: text
    -<Sketched Argument 1>
    +[E]
  (2) B
  ----
  (3) C
  -- Modus Ponens {uses:1,2; depends on: 1} --
  (4) [D]: text
    ->[E]: text
    +><Sketched Argument 1>: text
    
<Reconstructed Argument>
  ->[F]: text
  +><Sketched Argument 2>`;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(Object.keys(result.arguments!).length).to.equal(3);
    expect(Object.keys(result.statements!).length).to.equal(6);

    let argument = result.arguments!["Reconstructed Argument"];
    //console.log(util.inspect(argument));
    expect(argument).to.exist;
    expect(argument.pcs!.length).to.equal(4);
    expect(argument.relations!.length).to.equal(0); //all relations get transformed to relations of conclusion

    expect(argument.pcs![0].role).to.equal(StatementRole.PREMISE);
    expect(argument.pcs![1].role).to.equal(StatementRole.PREMISE);
    expect(argument.pcs![2].role).to.equal(
      StatementRole.PRELIMINARY_CONCLUSION
    );
    expect(argument.pcs![3].role).to.equal(StatementRole.MAIN_CONCLUSION);
    expect(result.statements![argument.pcs[0].title!]).to.exist;
    expect(result.statements![argument.pcs[1].title!]).to.exist;
    expect(result.statements![argument.pcs[2].title!]).to.exist;
    expect(result.statements![argument.pcs[3].title!]).to.exist;

    const conclusionEc = result.statements!["D"];
    expect(conclusionEc.members.length).to.equal(1);
    expect(conclusionEc.members[0].role).to.equal(
      StatementRole.MAIN_CONCLUSION
    );
    expect(conclusionEc.isUsedAsMainConclusion).to.be.true;

    let premise = result.statements![argument.pcs[0].title!];
    expect(!!premise.isUsedAsTopLevelStatement).to.be.false;
    expect(!!premise.isUsedAsRelationStatement).to.be.false;
    expect(!!premise.isUsedAsMainConclusion).to.be.false;
    expect(!!premise.isUsedAsPreliminaryConclusion).to.be.false;
    expect(!!premise.isUsedAsPremise).to.be.true;
    expect(premise.relations!.length).to.equal(2);

    expect(premise.relations![0].from!.title).to.equal("Sketched Argument 1");
    expect(premise.relations![0].to!.title).to.equal("A");
    expect(premise.relations![0].relationType).to.equal(RelationType.ATTACK);

    expect(premise.relations![1].from!.title).to.equal("E");
    expect(premise.relations![1].to!.title).to.equal("A");
    expect(premise.relations![1].relationType).to.equal(RelationType.ENTAILS);

    let preConclusion = result.statements![argument.pcs[2].title!];
    expect(!!preConclusion.isUsedAsPremise).to.be.false;
    expect(!!preConclusion.isUsedAsTopLevelStatement).to.be.false;
    expect(!!preConclusion.isUsedAsRelationStatement).to.be.false;
    expect(!!preConclusion.isUsedAsPreliminaryConclusion).to.be.true;
    expect(!!preConclusion.isUsedAsMainConclusion).to.be.false;

    expect(argument.pcs[3].title).to.equal("D");
    let conclusion = result.statements![argument.pcs[3].title!];
    expect(!!conclusion.isUsedAsTopLevelStatement).to.be.false;
    expect(!!conclusion.isUsedAsRelationStatement).to.be.false;
    expect(!!conclusion.isUsedAsPreliminaryConclusion).to.be.false;
    expect(!!conclusion.isUsedAsMainConclusion).to.be.true;
    expect(!!conclusion.isUsedAsPremise).to.be.false;
    expect(conclusion.relations!.length).to.equal(4); //with transformed relations from the argument

    expect(conclusion.relations![0].from!.title).to.equal("D");
    expect(conclusion.relations![0].to!.title).to.equal("E");
    expect(conclusion.relations![0].relationType).to.equal(
      RelationType.CONTRARY
    );

    expect(conclusion.relations![1].from!.title).to.equal("D");
    expect(conclusion.relations![1].to!.title).to.equal("Sketched Argument 1");
    expect(conclusion.relations![1].relationType).to.equal(
      RelationType.SUPPORT
    );

    expect(conclusion.relations![2].relationType).to.equal(
      RelationType.CONTRARY
    );
    expect(conclusion.relations![2].from!.title).to.equal("D");
    expect(conclusion.relations![2].to!.title).to.equal("F");

    expect(conclusion.relations![3].relationType).to.equal(
      RelationType.SUPPORT
    );
    expect(conclusion.relations![3].from!.title).to.equal("D");
    expect(conclusion.relations![3].to!.title).to.equal("Sketched Argument 2");

    let inference = (<IConclusion>argument.pcs[3]).inference!;
    expect(inference).to.exist;
    expect(inference.inferenceRules!.length).to.equal(1);
    expect(inference.inferenceRules![0]).to.equal("Modus Ponens");

    let statement = result.statements!["E"];
    expect(statement).to.exist;
    expect(!!statement.isUsedAsPreliminaryConclusion).to.be.false;
    expect(!!statement.isUsedAsMainConclusion).to.be.false;
    expect(!!statement.isUsedAsPremise).to.be.false;
    expect(statement.relations!.length).to.equal(2);

    let sketchedArgument = result.arguments!["Sketched Argument 1"];
    expect(sketchedArgument).to.exist;
    expect(sketchedArgument.relations!.length).to.equal(2);
  });
  it("can create the section hierarchy and set section property of statements and arguments", function() {
    let source = `# Section 1
  
  ## Section 2
  
  [A]: Text
  
  ### Section 3
  
  <B>: Text
  
  ## Section 4
  
  <B>
  
  (1) p
  (2) q
  ----
  (3) r
  `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    //console.log(JSON.stringify(result.sections,null,2));
    expect(result.sections).to.exist;
    expect(result.sections!.length).to.equal(1);
    expect(result.sections![0].title).to.equal("Section 1");
    expect(result.sections![0].children).to.exist;
    expect(result.sections![0].children.length).to.equal(2);
    expect(result.sections![0].children[0].title).to.equal("Section 2");
    expect(result.sections![0].children[0].children.length).to.equal(1);
    expect(result.sections![0].children[0].children[0].title).to.equal(
      "Section 3"
    );
    expect(
      result.sections![0].children[0].children[0].children.length
    ).to.equal(0);
    expect(result.sections![0].children[1].title).to.equal("Section 4");
    expect(result.sections![0].children[1].children.length).to.equal(0);

    expect(result.statements!["A"]).to.exist;
    expect(result.statements!["A"].members[0].section).to.exist;
    expect(result.statements!["A"].members[0].section!.title).to.equal(
      "Section 2"
    );

    expect(result.arguments!["B"]).to.exist;
    expect(result.arguments!["B"].section).to.exist;
    expect(result.arguments!["B"].section!.title).to.equal("Section 4");
    expect(result.arguments!["B"].descriptions[0].section).to.exist;
    expect(result.arguments!["B"].descriptions[0].section!.title).to.equal(
      "Section 3"
    );
  });
  it("can create tags lists", function() {
    let source = `[Statement 1]: #tag-1 text
  
  [Statement 2]: text #tag-1 #(tag 2)
  
  <Argument 1>: text #tag-1 #tag3 #tag4
  
  [Statement 1]: #tag-5 #tag-6 
  `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.tags).to.exist;
    expect(result.tags!.length).to.equal(6);
    expect(result.statements!["Statement 1"].tags!.length).to.equal(3);
    expect(
      result.statements!["Statement 2"].members[
        result.statements!["Statement 2"].members.length - 1
      ].text
    ).to.equal("text #tag-1 #(tag 2)");
    expect(result.statements!["Statement 2"].tags!.length).to.equal(2);
    expect(result.arguments!["Argument 1"].tags!.length).to.equal(3);
  });
  it("can identify duplicates in outgoing relations of reconstructed argument and main conclusion", function() {
    let source = `<A1>: A1
  - <A2>: A2
    
<A2>

 (1) P
 (2) P
 ----
 (3) C
   -> <A1> 
  `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.relations).to.exist;
    expect(result.relations!.length).to.equal(1);
  });
  it("can create section titles from headings with mentions, tags and ranges", function() {
    let source = `# @[A] @<B> #tag **bold** _italic_
  
  [A]
  
  <B>
  `;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.sections).to.exist;
    expect(result.sections!.length).to.equal(1);
    expect(result.sections![0].title).to.equal("@[A] @<B> #tag bold italic");
    expect(result.sections![0].tags!.length).to.equal(1);
    expect(result.sections![0].ranges!.length).to.equal(5);
    expect(result.arguments!["B"]).to.exist;
    expect(result.statements!["A"]).to.exist;
  });
  it("can parse escaped chars", function() {
    let source = fs.readFileSync("./test/model-escaped-chars.argdown", "utf8");

    //let source = `[A]: \\[text\\] text`;
    let result = app.run({
      process: ["parse-input", "build-model"],
      input: source
    });
    expect(result.statements!["A"]).to.exist;
    expect(
      IEquivalenceClass.getCanonicalMemberText(result.statements!["A"])
    ).to.equal("[text] text");
  });
  it("can return error with token location for incomplete reconstruction", function() {
    let source = `sdsadad

(1) adasdasd`;
    let result = app.run({ process: ["parse-input"], input: source });
    //console.log(result.parserErrors[0]);
    expect((<any>result.parserErrors![0]).previousToken.startLine).to.equal(3);
    expect((<any>result.parserErrors![0]).previousToken.startColumn).to.equal(
      5
    );
  });
  it("throws exception if AST is missing", function() {
    const source = "[Test]: Hello _World_!";
    const result = app.run({
      process: ["build-model"],
      input: source,
      logLevel: "error",
      logExceptions: false
    });
    expect(result.exceptions!.length).to.equal(1);
    expect(result.exceptions![0].message).to.contain("No AST field");
  });
  it("throws exception if statements are missing", function() {
    const source = "[Test]: Hello _World_!";
    const result = app.run(
      {
        process: ["build-model"],
        input: source,
        logLevel: "error",
        logExceptions: false
      },
      { ast: <IAstNode>{} }
    );
    expect(result.exceptions!.length).to.equal(1);
    expect(result.exceptions![0].message).to.contain("No statements field");
  });
  it("throws exception if arguments are missing", function() {
    const source = "[Test]: Hello _World_!";
    const result = app.run(
      {
        process: ["build-model"],
        input: source,
        logLevel: "error",
        logExceptions: false
      },
      { ast: <IAstNode>{}, statements: {} }
    );
    expect(result.exceptions!.length).to.equal(1);
    expect(result.exceptions![0].message).to.contain("No arguments field");
  });
  it("throws exception if relations are missing", function() {
    const source = "[Test]: Hello _World_!";
    const result = app.run(
      {
        process: ["build-model"],
        input: source,
        logLevel: "error",
        logExceptions: false
      },
      { ast: <IAstNode>{}, statements: {}, arguments: {} }
    );
    expect(result.exceptions!.length).to.equal(1);
    expect(result.exceptions![0].message).to.contain("No relations field");
  });
  it("throws exception if relation source is missing", function() {
    const source = "[Test]: Hello _World_!";
    const result = app.run(
      {
        process: ["build-model"],
        input: source,
        logLevel: "error",
        logExceptions: false
      },
      {
        ast: <IAstNode>{},
        statements: {},
        arguments: {},
        relations: [<IRelation>{ relationType: RelationType.SUPPORT }]
      }
    );
    expect(result.exceptions!.length).to.equal(1);
    expect(result.exceptions![0].message).to.contain("without source");
  });
  it("throws exception if relation target is missing", function() {
    const source = "[Test]: Hello _World_!";
    const rel = <IRelation>{ relationType: RelationType.SUPPORT };
    rel.from = {
      type: ArgdownTypes.EQUIVALENCE_CLASS,
      relations: [],
      members: [],
      title: "test"
    };
    const result = app.run(
      {
        process: ["build-model"],
        input: source,
        logLevel: "error",
        logExceptions: false
      },
      { ast: <IAstNode>{}, statements: {}, arguments: {}, relations: [rel] }
    );
    expect(result.exceptions!.length).to.equal(1);
    expect(result.exceptions![0].message).to.contain("without target");
  });
  it("adds two members for main conclusion and relation statement", function() {
    const source = `
        [S1]: test
            - [S2]: test

        (1) A
        (2) B
        ----
        (3) [S2]
    `;
    const result = app.run({
      process: ["parse-input", "build-model"],
      input: source,
      logLevel: "error",
      logExceptions: false
    });
    expect(Object.keys(result.statements!).length).to.equal(4);
    expect(result.statements!["S2"].members.length).to.equal(2);
  });
});
