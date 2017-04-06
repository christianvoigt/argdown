'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();

describe("ArgdownPreprocessor", function () {
  var plugin = new _index.ArgdownPreprocessor();
  app.addPlugin(plugin, 'preprocessor');

  it("can create statements dictionary and save statement by title", function () {
    var source = "[Test]: Hello _World_!";
    app.parse(source);
    var result = app.run('preprocessor');
    (0, _chai.expect)(result.statements['Test']).to.exist;
    (0, _chai.expect)(result.statements['Test'].members[0].text).to.equal('Hello World!');
    (0, _chai.expect)(result.statements['Test'].members[0].ranges.length).to.equal(1);
    (0, _chai.expect)(result.statements['Test'].members[0].ranges[0].type).to.equal('italic');
    (0, _chai.expect)(result.statements['Test'].members[0].ranges[0].start).to.equal(6);
    (0, _chai.expect)(result.statements['Test'].members[0].ranges[0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function () {
    var source = "<Test>: Hello _World_!";
    app.parse(source);
    var result = app.run('preprocessor');
    (0, _chai.expect)(result.arguments['Test']).to.exist;
    (0, _chai.expect)(result.arguments['Test'].descriptions.length).to.equal(1);
    var description = result.arguments['Test'].descriptions[0];
    (0, _chai.expect)(description.text).to.equal('Hello World!');
    (0, _chai.expect)(description.ranges.length).to.equal(1);
    (0, _chai.expect)(description.ranges[0].type).to.equal('italic');
    (0, _chai.expect)(description.ranges[0].start).to.equal(6);
    (0, _chai.expect)(description.ranges[0].stop).to.equal(10);
  });
  it("can create statement relations and ignore duplicates", function () {
    var source = "[A]: The Beatles are the best!\n  +[B]: The Beatles made 'Rubber Soul'!\n  -><C>: The Rolling Stones were cooler!\n\n [A]\n  +[B]\n  -><C>";
    app.parse(source);
    var result = app.run('preprocessor');
    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(2);
    (0, _chai.expect)(Object.keys(result.arguments).length).to.equal(1);
    (0, _chai.expect)(result.relations.length).to.equal(2);

    (0, _chai.expect)(result.statements['A']).to.exist;
    (0, _chai.expect)(result.statements['A'].relations.length).to.equal(2);
    (0, _chai.expect)(result.statements['A'].relations[0].type).to.equal('support');
    (0, _chai.expect)(result.statements['A'].relations[0].to).to.equal(plugin.statements['A']);
    (0, _chai.expect)(result.statements['A'].relations[0].from).to.equal(plugin.statements['B']);
    (0, _chai.expect)(result.statements['A'].relations[0].status).to.equal('reconstructed');
    (0, _chai.expect)(result.statements['B']).to.exist;
    (0, _chai.expect)(result.statements['B'].relations.length).to.equal(1);
    (0, _chai.expect)(result.arguments['C']).to.exist;
    (0, _chai.expect)(result.arguments['C'].relations.length).to.equal(1);
    (0, _chai.expect)(result.arguments['C'].relations[0].type).to.equal('attack');
    (0, _chai.expect)(result.arguments['C'].relations[0].from).to.equal(plugin.statements['A']);
    (0, _chai.expect)(result.arguments['C'].relations[0].to).to.equal(plugin.arguments['C']);
    (0, _chai.expect)(result.arguments['C'].relations[0].status).to.equal('sketched');
  });
  it("can create sketched argument relations", function () {
    var source = "<A>: The Beatles are the best!\n  +<B>: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    app.parse(source);
    var result = app.run('preprocessor');
    (0, _chai.expect)(result.arguments['A']).to.exist;
    (0, _chai.expect)(result.arguments['A'].relations.length).to.equal(2);
    (0, _chai.expect)(result.arguments['A'].relations[0].type).to.equal('support');
    (0, _chai.expect)(result.arguments['A'].relations[0].to).to.equal(plugin.arguments['A']);
    (0, _chai.expect)(result.arguments['A'].relations[0].from).to.equal(plugin.arguments['B']);
    (0, _chai.expect)(result.arguments['A'].relations[0].status).to.equal('sketched');
    (0, _chai.expect)(result.arguments['B']).to.exist;
    (0, _chai.expect)(result.arguments['B'].relations.length).to.equal(1);
    (0, _chai.expect)(result.statements['C']).to.exist;
    (0, _chai.expect)(result.statements['C'].relations.length).to.equal(1);
    (0, _chai.expect)(result.statements['C'].relations[0].type).to.equal('attack');
    (0, _chai.expect)(result.statements['C'].relations[0].from).to.equal(plugin.arguments['A']);
    (0, _chai.expect)(result.statements['C'].relations[0].to).to.equal(plugin.statements['C']);
    (0, _chai.expect)(result.statements['C'].relations[0].status).to.equal('sketched');
  });
  it("can process a single argument", function () {
    var source = "(1) [s1]: A\n(2) [s2]: B\n----\n(3) [s3]: C";
    app.parse(source);
    var result = app.run('preprocessor');
    (0, _chai.expect)(result.arguments['Untitled 1']).to.exist;
    (0, _chai.expect)(result.statements['s1']).to.exist;
    (0, _chai.expect)(result.statements['s2']).to.exist;
    (0, _chai.expect)(result.statements['s3']).to.exist;
  });

  it("can create argument reconstructions", function () {
    var source = "<Reconstructed Argument>\n\n(1) [A]: text\n  -<Sketched Argument 1>\n  +[D]\n(2) B\n-- Modus Ponens (uses:1,2; depends on: 1) --\n(3) [C]: text\n  ->[D]: text\n  +><Sketched Argument 1>: text\n\n<Reconstructed Argument>\n  ->[E]: text\n  +><Sketched Argument 2>";
    app.parse(source);
    var result = app.run('preprocessor');
    (0, _chai.expect)(Object.keys(result.arguments).length).to.equal(3);
    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(5);

    var argument = result.arguments['Reconstructed Argument'];
    //console.log(util.inspect(argument));
    (0, _chai.expect)(argument).to.exist;
    (0, _chai.expect)(argument.pcs.length).to.equal(3);
    (0, _chai.expect)(argument.relations.length).to.equal(1); //second relation gets transformed to relation of conclusion

    (0, _chai.expect)(argument.relations[0].type).to.equal("support");
    (0, _chai.expect)(argument.relations[0].from.title).to.equal("Reconstructed Argument");
    (0, _chai.expect)(argument.relations[0].to.title).to.equal("Sketched Argument 2");
    (0, _chai.expect)(argument.relations[0].status).to.equal("sketched");

    (0, _chai.expect)(argument.pcs[0].role).to.equal('premise');
    (0, _chai.expect)(argument.pcs[1].role).to.equal('premise');
    (0, _chai.expect)(argument.pcs[2].role).to.equal('conclusion');
    (0, _chai.expect)(result.statements[argument.pcs[0].title]).to.exist;
    (0, _chai.expect)(result.statements[argument.pcs[1].title]).to.exist;
    (0, _chai.expect)(result.statements[argument.pcs[2].title]).to.exist;

    var premise = result.statements[argument.pcs[0].title];
    (0, _chai.expect)(premise.isUsedAsPremise).to.be.true;
    (0, _chai.expect)(premise.isUsedAsConclusion).to.be.false;
    (0, _chai.expect)(premise.isUsedAsRootOfStatementTree).to.be.false;
    (0, _chai.expect)(premise.isUsedAsChildOfStatementTree).to.be.false;
    (0, _chai.expect)(premise.relations.length).to.equal(2);

    (0, _chai.expect)(premise.relations[0].from.title).to.equal('Sketched Argument 1');
    (0, _chai.expect)(premise.relations[0].to.title).to.equal('A');
    (0, _chai.expect)(premise.relations[0].type).to.equal('attack');
    (0, _chai.expect)(premise.relations[0].status).to.equal('sketched');

    (0, _chai.expect)(premise.relations[1].from.title).to.equal('D');
    (0, _chai.expect)(premise.relations[1].to.title).to.equal('A');
    (0, _chai.expect)(premise.relations[1].type).to.equal('support');
    (0, _chai.expect)(premise.relations[1].status).to.equal('reconstructed');

    (0, _chai.expect)(argument.pcs[2].title).to.equal('C');
    var conclusion = result.statements[argument.pcs[2].title];
    (0, _chai.expect)(conclusion.isUsedAsConclusion).to.be.true;
    (0, _chai.expect)(conclusion.isUsedAsPremise).to.be.false;
    (0, _chai.expect)(conclusion.isUsedAsRootOfStatementTree).to.be.false;
    (0, _chai.expect)(conclusion.isUsedAsChildOfStatementTree).to.be.false;
    (0, _chai.expect)(conclusion.relations.length).to.equal(3); //with transformed relation from the argument

    (0, _chai.expect)(conclusion.relations[0].status).to.equal('reconstructed');
    (0, _chai.expect)(conclusion.relations[0].from.title).to.equal('C');
    (0, _chai.expect)(conclusion.relations[0].to.title).to.equal('D');
    (0, _chai.expect)(conclusion.relations[0].type).to.equal('attack');

    (0, _chai.expect)(conclusion.relations[1].status).to.equal('sketched');
    (0, _chai.expect)(conclusion.relations[1].from.title).to.equal('C');
    (0, _chai.expect)(conclusion.relations[1].to.title).to.equal('Sketched Argument 1');
    (0, _chai.expect)(conclusion.relations[1].type).to.equal('support');

    (0, _chai.expect)(conclusion.relations[2].type).to.equal("attack");
    (0, _chai.expect)(conclusion.relations[2].from.title).to.equal("C");
    (0, _chai.expect)(conclusion.relations[2].to.title).to.equal("E");
    (0, _chai.expect)(conclusion.relations[2].status).to.equal("reconstructed");

    var inference = argument.pcs[2].inference;
    (0, _chai.expect)(inference).to.exist;
    (0, _chai.expect)(inference.inferenceRules.length).to.equal(1);
    (0, _chai.expect)(inference.inferenceRules[0]).to.equal('Modus Ponens');
    (0, _chai.expect)(inference.metaData['uses'].length).to.equal(2);
    (0, _chai.expect)(inference.metaData['uses'][0]).to.equal('1');
    (0, _chai.expect)(inference.metaData['uses'][1]).to.equal('2');
    (0, _chai.expect)(inference.metaData['depends on']).to.equal('1');

    var statement = result.statements['D'];
    (0, _chai.expect)(statement).to.exist;
    (0, _chai.expect)(statement.isUsedAsRootOfStatementTree).to.be.false;
    (0, _chai.expect)(statement.isUsedAsChildOfStatementTree).to.be.false;
    (0, _chai.expect)(statement.isUsedAsConclusion).to.be.false;
    (0, _chai.expect)(statement.isUsedAsPremise).to.be.false;
    (0, _chai.expect)(statement.relations.length).to.equal(2);

    var sketchedArgument = result.arguments['Sketched Argument 1'];
    (0, _chai.expect)(sketchedArgument).to.exist;
    (0, _chai.expect)(sketchedArgument.relations.length).to.equal(2);
  });
});
//# sourceMappingURL=preprocessor.spec.js.map