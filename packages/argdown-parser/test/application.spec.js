import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor} from '../src/index.js';

let app = new ArgdownApplication();

describe("Application", function() {
  it("can add, get, call and remove plugins", function(){
    let source = "Hello World!";
    let statements = 0;
    let plugin = {
      name: "TestPlugin",
      argdownListeners : {
        statementEntry: ()=>statements++
      }
    };
    app.addPlugin(plugin);
    expect(app.getPlugin(plugin.name)).to.equal(plugin);
    app.parse(source);
    app.run();
    expect(statements).to.equal(1);
    statements = 0;
    app.removePlugin(plugin);
    app.parse(source);
    app.run();
    expect(statements).to.equal(0);
  });
});
describe("ArgdownPreprocessor", function() {
  let plugin = new ArgdownPreprocessor();
  app.addPlugin(plugin,'preprocessor');

  it("can create statements dictionary and save statement by title", function(){
    let source = "[Test]: Hello _World_!";
    app.parse(source);
    app.run('preprocessor');
    expect(plugin.statements['Test']).to.exist;
    expect(plugin.statements['Test'].members[0].text).to.equal('Hello World!');
    expect(plugin.statements['Test'].members[0].ranges.length).to.equal(1);
    expect(plugin.statements['Test'].members[0].ranges[0].type).to.equal('italic');
    expect(plugin.statements['Test'].members[0].ranges[0].start).to.equal(6);
    expect(plugin.statements['Test'].members[0].ranges[0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function(){
    let source = "<Test>: Hello _World_!";
    app.parse(source);
    app.run('preprocessor');
    expect(plugin.arguments['Test']).to.exist;
    expect(plugin.arguments['Test'].descriptions.length).to.equal(1);
    let description = plugin.arguments['Test'].descriptions[0];
    expect(description.text).to.equal('Hello World!');
    expect(description.ranges.length).to.equal(1);
    expect(description.ranges[0].type).to.equal('italic');
    expect(description.ranges[0].start).to.equal(6);
    expect(description.ranges[0].stop).to.equal(10);
  });
    it("can create relations", function(){
    let source = "[A]: The Beatles are the best!\n  +[B]: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    app.parse(source);
    app.run('preprocessor');
    expect(plugin.statements['A']).to.exist;
    expect(plugin.statements['A'].relations.length).to.equal(2);
    expect(plugin.statements['A'].relations[0].type).to.equal('support');
    expect(plugin.statements['A'].relations[0].to).to.equal(plugin.statements['A']);
    expect(plugin.statements['A'].relations[0].from).to.equal(plugin.statements['B']);
    expect(plugin.statements['B']).to.exist;
    expect(plugin.statements['B'].relations.length).to.equal(1);
    expect(plugin.statements['C']).to.exist;
    expect(plugin.statements['C'].relations.length).to.equal(1);
    expect(plugin.statements['C'].relations[0].type).to.equal('attack');
    expect(plugin.statements['C'].relations[0].from).to.equal(plugin.statements['A']);
    expect(plugin.statements['C'].relations[0].to).to.equal(plugin.statements['C']);
  });
  it("can create argument reconstructions", function(){
  let source = "<Argument>\n\n(1) A\n(2) B\n-- Modus Ponens (uses:1,2; depends on: 1) --\n(3) C";
  app.parse(source);
  app.run('preprocessor');
  let argument = plugin.arguments['Argument'];
  expect(argument).to.exist;
  expect(argument.pcs.length).to.equal(3);
  expect(argument.pcs[0].role).to.equal('premise');
  expect(argument.pcs[1].role).to.equal('premise');
  expect(argument.pcs[2].role).to.equal('conclusion');
  expect(plugin.statements[argument.pcs[0].title]).to.exist;
  expect(plugin.statements[argument.pcs[1].title]).to.exist;
  expect(plugin.statements[argument.pcs[2].title]).to.exist;
  let inference = argument.pcs[2].inference;
  expect(inference).to.exist;
  expect(inference.inferenceRules.length).to.equal(1);
  expect(inference.inferenceRules[0]).to.equal('Modus Ponens');
  expect(inference.metaData['uses'].length).to.equal(2);
  expect(inference.metaData['uses'][0]).to.equal('1');
  expect(inference.metaData['uses'][1]).to.equal('2');
  expect(inference.metaData['depends on']).to.equal('1');
});
});
