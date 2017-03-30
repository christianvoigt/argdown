'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();

describe("Application", function () {
  it("can add, get, call and remove plugins", function () {
    var source = "Hello World!";
    var statements = 0;
    var plugin = {
      name: "TestPlugin",
      argdownListeners: {
        statementEntry: function statementEntry() {
          return statements++;
        }
      }
    };
    app.addPlugin(plugin);
    (0, _chai.expect)(app.getPlugin(plugin.name)).to.equal(plugin);
    app.parse(source);
    app.run();
    (0, _chai.expect)(statements).to.equal(1);
    statements = 0;
    app.removePlugin(plugin);
    app.parse(source);
    app.run();
    (0, _chai.expect)(statements).to.equal(0);
  });
});
describe("ArgdownPreprocessor", function () {
  var plugin = new _index.ArgdownPreprocessor();
  app.addPlugin(plugin, 'preprocessor');

  it("can create statements dictionary and save statement by title", function () {
    var source = "[Test]: Hello _World_!";
    app.parse(source);
    app.run('preprocessor');
    (0, _chai.expect)(plugin.statements['Test']).to.exist;
    (0, _chai.expect)(plugin.statements['Test'].members[0].text).to.equal('Hello World!');
    (0, _chai.expect)(plugin.statements['Test'].members[0].ranges.length).to.equal(1);
    (0, _chai.expect)(plugin.statements['Test'].members[0].ranges[0].type).to.equal('italic');
    (0, _chai.expect)(plugin.statements['Test'].members[0].ranges[0].start).to.equal(6);
    (0, _chai.expect)(plugin.statements['Test'].members[0].ranges[0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function () {
    var source = "<Test>: Hello _World_!";
    app.parse(source);
    app.run('preprocessor');
    (0, _chai.expect)(plugin.arguments['Test']).to.exist;
    (0, _chai.expect)(plugin.arguments['Test'].descriptions.length).to.equal(1);
    var description = plugin.arguments['Test'].descriptions[0];
    (0, _chai.expect)(description.text).to.equal('Hello World!');
    (0, _chai.expect)(description.ranges.length).to.equal(1);
    (0, _chai.expect)(description.ranges[0].type).to.equal('italic');
    (0, _chai.expect)(description.ranges[0].start).to.equal(6);
    (0, _chai.expect)(description.ranges[0].stop).to.equal(10);
  });
  it("can create relations", function () {
    var source = "[A]: The Beatles are the best!\n  +[B]: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    app.parse(source);
    app.run('preprocessor');
    (0, _chai.expect)(plugin.statements['A']).to.exist;
    (0, _chai.expect)(plugin.statements['A'].relations.length).to.equal(2);
    (0, _chai.expect)(plugin.statements['A'].relations[0].type).to.equal('support');
    (0, _chai.expect)(plugin.statements['A'].relations[0].to).to.equal(plugin.statements['A']);
    (0, _chai.expect)(plugin.statements['A'].relations[0].from).to.equal(plugin.statements['B']);
    (0, _chai.expect)(plugin.statements['B']).to.exist;
    (0, _chai.expect)(plugin.statements['B'].relations.length).to.equal(1);
    (0, _chai.expect)(plugin.statements['C']).to.exist;
    (0, _chai.expect)(plugin.statements['C'].relations.length).to.equal(1);
    (0, _chai.expect)(plugin.statements['C'].relations[0].type).to.equal('attack');
    (0, _chai.expect)(plugin.statements['C'].relations[0].from).to.equal(plugin.statements['A']);
    (0, _chai.expect)(plugin.statements['C'].relations[0].to).to.equal(plugin.statements['C']);
  });
  it("can create argument reconstructions", function () {
    var source = "<Argument>\n\n(1) A\n(2) B\n-- Modus Ponens (uses:1,2; depends on: 1) --\n(3) C";
    app.parse(source);
    app.run('preprocessor');
    var argument = plugin.arguments['Argument'];
    (0, _chai.expect)(argument).to.exist;
    (0, _chai.expect)(argument.pcs.length).to.equal(3);
    (0, _chai.expect)(argument.pcs[0].role).to.equal('premise');
    (0, _chai.expect)(argument.pcs[1].role).to.equal('premise');
    (0, _chai.expect)(argument.pcs[2].role).to.equal('conclusion');
    (0, _chai.expect)(plugin.statements[argument.pcs[0].title]).to.exist;
    (0, _chai.expect)(plugin.statements[argument.pcs[1].title]).to.exist;
    (0, _chai.expect)(plugin.statements[argument.pcs[2].title]).to.exist;
    var inference = argument.pcs[2].inference;
    (0, _chai.expect)(inference).to.exist;
    (0, _chai.expect)(inference.inferenceRules.length).to.equal(1);
    (0, _chai.expect)(inference.inferenceRules[0]).to.equal('Modus Ponens');
    (0, _chai.expect)(inference.metaData['uses'].length).to.equal(2);
    (0, _chai.expect)(inference.metaData['uses'][0]).to.equal('1');
    (0, _chai.expect)(inference.metaData['uses'][1]).to.equal('2');
    (0, _chai.expect)(inference.metaData['depends on']).to.equal('1');
  });
});
//# sourceMappingURL=application.spec.js.map