import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor} from '../src/index.js';

let app = new ArgdownApplication();

describe("ArgdownPreprocessor", function() {
  let plugin = new ArgdownPreprocessor();
  app.addPlugin(plugin,'preprocessor');

  it("can create statements dictionary and save statement by title", function(){
    let source = "[Test]: Hello _World_!";
    app.parse(source);
    let result = app.run('preprocessor');
    expect(result.statements['Test']).to.exist;
    expect(result.statements['Test'].members[0].text).to.equal('Hello World!');
    expect(result.statements['Test'].members[0].ranges.length).to.equal(1);
    expect(result.statements['Test'].members[0].ranges[0].type).to.equal('italic');
    expect(result.statements['Test'].members[0].ranges[0].start).to.equal(6);
    expect(result.statements['Test'].members[0].ranges[0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function(){
    let source = "<Test>: Hello _World_!";
    app.parse(source);
    let result = app.run('preprocessor');
    expect(result.arguments['Test']).to.exist;
    expect(result.arguments['Test'].descriptions.length).to.equal(1);
    let description = result.arguments['Test'].descriptions[0];
    expect(description.text).to.equal('Hello World!');
    expect(description.ranges.length).to.equal(1);
    expect(description.ranges[0].type).to.equal('italic');
    expect(description.ranges[0].start).to.equal(6);
    expect(description.ranges[0].stop).to.equal(10);
  });
  it("can create statement relations and ignore duplicates", function(){
    let source = "[A]: The Beatles are the best!\n  +[B]: The Beatles made 'Rubber Soul'!\n  -><C>: The Rolling Stones were cooler!\n\n [A]\n  +[B]\n  -><C>";
    app.parse(source);
    let result = app.run('preprocessor');
    expect(Object.keys(result.statements).length).to.equal(2);
    expect(Object.keys(result.arguments).length).to.equal(1);
    expect(result.relations.length).to.equal(2);

    expect(result.statements['A']).to.exist;
    expect(result.statements['A'].relations.length).to.equal(2);
    expect(result.statements['A'].relations[0].type).to.equal('entails');
    expect(result.statements['A'].relations[0].to).to.equal(plugin.statements['A']);
    expect(result.statements['A'].relations[0].from).to.equal(plugin.statements['B']);
    expect(result.statements['A'].relations[0].status).to.equal('reconstructed');
    expect(result.statements['B']).to.exist;
    expect(result.statements['B'].relations.length).to.equal(1);
    expect(result.arguments['C']).to.exist;
    expect(result.arguments['C'].relations.length).to.equal(1);
    expect(result.arguments['C'].relations[0].type).to.equal('attack');
    expect(result.arguments['C'].relations[0].from).to.equal(plugin.statements['A']);
    expect(result.arguments['C'].relations[0].to).to.equal(plugin.arguments['C']);
    expect(result.arguments['C'].relations[0].status).to.equal('sketched');
  });
  it("can ignore duplicates of argument relations", function(){
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
    app.parse(source);
    let result = app.run('preprocessor');
    expect(Object.keys(result.statements).length).to.equal(4);
    expect(Object.keys(result.arguments).length).to.equal(1);
    expect(result.relations.length).to.equal(1);
  });  
  it("can create sketched argument relations", function(){
    let source = "<A>: The Beatles are the best!\n  +<B>: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    app.parse(source);
    let result = app.run('preprocessor');
    expect(result.arguments['A']).to.exist;
    expect(result.arguments['A'].relations.length).to.equal(2);
    expect(result.arguments['A'].relations[0].type).to.equal('support');
    expect(result.arguments['A'].relations[0].to).to.equal(plugin.arguments['A']);
    expect(result.arguments['A'].relations[0].from).to.equal(plugin.arguments['B']);
    expect(result.arguments['A'].relations[0].status).to.equal('sketched');
    expect(result.arguments['B']).to.exist;
    expect(result.arguments['B'].relations.length).to.equal(1);
    expect(result.statements['C']).to.exist;
    expect(result.statements['C'].relations.length).to.equal(1);
    expect(result.statements['C'].relations[0].type).to.equal('attack');
    expect(result.statements['C'].relations[0].from).to.equal(plugin.arguments['A']);
    expect(result.statements['C'].relations[0].to).to.equal(plugin.statements['C']);
    expect(result.statements['C'].relations[0].status).to.equal('sketched');
  });
  it("does not add empty statements as members to equivalence class", function(){
    let source = `[A]: B
    
    [A]`;
    app.parse(source);
    let result = app.run('preprocessor');
    expect(result.statements['A']).to.exist;
    expect(result.statements['A'].members.length).to.equal(1);
  });  
  it("does not create duplicate relations for contradictions", function(){
    let source = `[A]: A
      >< [B]: B
    
    [B]
      >< [A]`;
    app.parse(source);
    let result = app.run('preprocessor');
    expect(app.parserErrors.length).to.equal(0);
    expect(Object.keys(result.statements).length).to.equal(2);
    expect(Object.keys(result.relations).length).to.equal(1);
  });      
  it("can process a single argument", function(){
    let source = "(1) [s1]: A\n(2) [s2]: B\n----\n(3) [s3]: C";
    app.parse(source);
    let result = app.run('preprocessor');
    expect(result.arguments['Untitled 1']).to.exist;
    expect(result.statements['s1']).to.exist;
    expect(result.statements['s2']).to.exist;
    expect(result.statements['s3']).to.exist;
  });  

  it("can create argument reconstructions", function(){
  let source = `<Reconstructed Argument>
  
  (1) [A]: text
    -<Sketched Argument 1>
    +[E]
  (2) B
  ----
  (3) C
  -- Modus Ponens (uses:1,2; depends on: 1) --
  (4) [D]: text
    ->[E]: text
    +><Sketched Argument 1>: text
    
<Reconstructed Argument>
  ->[F]: text
  +><Sketched Argument 2>`;
  app.parse(source);
  let result = app.run('preprocessor');
  expect(Object.keys(result.arguments).length).to.equal(3);
  expect(Object.keys(result.statements).length).to.equal(6);

  let argument = result.arguments['Reconstructed Argument'];
  //console.log(util.inspect(argument));
  expect(argument).to.exist;
  expect(argument.pcs.length).to.equal(4);
  expect(argument.relations.length).to.equal(1); //second relation gets transformed to relation of conclusion

  expect(argument.relations[0].type).to.equal("support");
  expect(argument.relations[0].from.title).to.equal("Reconstructed Argument");
  expect(argument.relations[0].to.title).to.equal("Sketched Argument 2");
  expect(argument.relations[0].status).to.equal("sketched");


  expect(argument.pcs[0].role).to.equal('premise');
  expect(argument.pcs[1].role).to.equal('premise');
  expect(argument.pcs[2].role).to.equal('conclusion');
  expect(argument.pcs[3].role).to.equal('conclusion');
  expect(result.statements[argument.pcs[0].title]).to.exist;
  expect(result.statements[argument.pcs[1].title]).to.exist;
  expect(result.statements[argument.pcs[2].title]).to.exist;
  expect(result.statements[argument.pcs[3].title]).to.exist;

  let premise = result.statements[argument.pcs[0].title];
  expect(premise.isUsedAsPremise).to.be.true;
  expect(premise.isUsedAsConclusion).to.be.false;
  expect(premise.isUsedAsRootOfStatementTree).to.be.false;
  expect(premise.isUsedAsChildOfStatementTree).to.be.false;
  expect(premise.relations.length).to.equal(2);

  expect(premise.relations[0].from.title).to.equal('Sketched Argument 1');
  expect(premise.relations[0].to.title).to.equal('A');
  expect(premise.relations[0].type).to.equal('attack');
  expect(premise.relations[0].status).to.equal('sketched');

  expect(premise.relations[1].from.title).to.equal('E');
  expect(premise.relations[1].to.title).to.equal('A');
  expect(premise.relations[1].type).to.equal('entails');
  expect(premise.relations[1].status).to.equal('reconstructed');

  expect(argument.pcs[3].title).to.equal('D');
  let conclusion = result.statements[argument.pcs[3].title];
  expect(conclusion.isUsedAsConclusion).to.be.true;
  expect(conclusion.isUsedAsPremise).to.be.false;
  expect(conclusion.isUsedAsRootOfStatementTree).to.be.false;
  expect(conclusion.isUsedAsChildOfStatementTree).to.be.false;
  expect(conclusion.relations.length).to.equal(3); //with transformed relation from the argument

  expect(conclusion.relations[0].status).to.equal('reconstructed');
  expect(conclusion.relations[0].from.title).to.equal('D');
  expect(conclusion.relations[0].to.title).to.equal('E');
  expect(conclusion.relations[0].type).to.equal('contrary');

  expect(conclusion.relations[1].status).to.equal('sketched');
  expect(conclusion.relations[1].from.title).to.equal('D');
  expect(conclusion.relations[1].to.title).to.equal('Sketched Argument 1');
  expect(conclusion.relations[1].type).to.equal('support');


  expect(conclusion.relations[2].type).to.equal("contrary");
  expect(conclusion.relations[2].from.title).to.equal("D");
  expect(conclusion.relations[2].to.title).to.equal("F");
  expect(conclusion.relations[2].status).to.equal("reconstructed");


  let inference = argument.pcs[3].inference;
  expect(inference).to.exist;
  expect(inference.inferenceRules.length).to.equal(1);
  expect(inference.inferenceRules[0]).to.equal('Modus Ponens');
  expect(inference.metaData['uses'].length).to.equal(2);
  expect(inference.metaData['uses'][0]).to.equal('1');
  expect(inference.metaData['uses'][1]).to.equal('2');
  expect(inference.metaData['depends on']).to.equal('1');

  let statement = result.statements['E'];
  expect(statement).to.exist;
  expect(statement.isUsedAsRootOfStatementTree).to.be.false;
  expect(statement.isUsedAsChildOfStatementTree).to.be.false;
  expect(statement.isUsedAsConclusion).to.be.false;
  expect(statement.isUsedAsPremise).to.be.false;
  expect(statement.relations.length).to.equal(2);

  let sketchedArgument = result.arguments['Sketched Argument 1'];
  expect(sketchedArgument).to.exist;
  expect(sketchedArgument.relations.length).to.equal(2);

});
it("can create the section hierarchy and set section property of statements and arguments", function(){
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
  app.parse(source);
  let result = app.run('preprocessor');
  //console.log(JSON.stringify(result.sections,null,2));
  expect(result.sections).to.exist;
  expect(result.sections.length).to.equal(1);
  expect(result.sections[0].title).to.equal('Section 1');
  expect(result.sections[0].children).to.exist;
  expect(result.sections[0].children.length).to.equal(2);
  expect(result.sections[0].children[0].title).to.equal('Section 2');
  expect(result.sections[0].children[0].children.length).to.equal(1);
  expect(result.sections[0].children[0].children[0].title).to.equal('Section 3');
  expect(result.sections[0].children[0].children[0].children.length).to.equal(0);
  expect(result.sections[0].children[1].title).to.equal('Section 4');
  expect(result.sections[0].children[1].children.length).to.equal(0);
  
  expect(result.statements['A']).to.exist;
  expect(result.statements['A'].members[0].section).to.exist;
  expect(result.statements['A'].members[0].section.title).to.equal('Section 2');  
  
  expect(result.arguments['B']).to.exist;
  expect(result.arguments['B'].section).to.exist;
  expect(result.arguments['B'].section.title).to.equal('Section 4');
  expect(result.arguments['B'].descriptions[0].section).to.exist;
  expect(result.arguments['B'].descriptions[0].section.title).to.equal('Section 3');
}); 
});
