'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _index.ArgdownApplication();

describe("ModelPlugin", function () {
  var parserPlugin = new _index.ParserPlugin();
  var modelPlugin = new _index.ModelPlugin();
  app.addPlugin(parserPlugin, 'parse-input');
  app.addPlugin(modelPlugin, 'build-model');

  it("can create statements dictionary and save statement by title", function () {
    var source = "[Test]: Hello _World_!";
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.statements['Test']).to.exist;
    (0, _chai.expect)(result.statements['Test'].members[0].text).to.equal('Hello World!');
    (0, _chai.expect)(result.statements['Test'].getCanonicalStatement().text).to.equal('Hello World!');
    (0, _chai.expect)(result.statements['Test'].getCanonicalText()).to.equal('Hello World!');
    (0, _chai.expect)(result.statements['Test'].members[0].ranges.length).to.equal(1);
    (0, _chai.expect)(result.statements['Test'].members[0].ranges[0].type).to.equal('italic');
    (0, _chai.expect)(result.statements['Test'].members[0].ranges[0].start).to.equal(6);
    (0, _chai.expect)(result.statements['Test'].members[0].ranges[0].stop).to.equal(10);
  });
  it("can create arguments dictionary and save argument by title", function () {
    var source = "<Test>: Hello _World_!";
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.arguments['Test']).to.exist;
    (0, _chai.expect)(result.arguments['Test'].descriptions.length).to.equal(1);
    var description = result.arguments['Test'].descriptions[0];
    (0, _chai.expect)(result.arguments['Test'].getCanonicalDescription()).to.equal(description);
    (0, _chai.expect)(description.text).to.equal('Hello World!');
    (0, _chai.expect)(description.ranges.length).to.equal(1);
    (0, _chai.expect)(description.ranges[0].type).to.equal('italic');
    (0, _chai.expect)(description.ranges[0].start).to.equal(6);
    (0, _chai.expect)(description.ranges[0].stop).to.equal(10);
  });
  it("can create statement relations and ignore duplicates", function () {
    var source = '\n    [A]: The Beatles are the best!\n      + [B]: The Beatles made \'Rubber Soul\'!\n      -> <C>: The Rolling Stones were cooler!\n        \n    [A]\n      + [B]\n      -> <C>\n    ';
    var result = app.run(['parse-input', 'build-model'], { input: source });

    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(2);
    (0, _chai.expect)(Object.keys(result.arguments).length).to.equal(1);
    (0, _chai.expect)(result.relations.length).to.equal(2);

    (0, _chai.expect)(result.statements['A']).to.exist;
    (0, _chai.expect)(result.statements['A'].relations.length).to.equal(2);
    (0, _chai.expect)(result.statements['A'].relations[0].type).to.equal('entails');
    (0, _chai.expect)(result.statements['A'].relations[0].to).to.equal(modelPlugin.statements['A']);
    (0, _chai.expect)(result.statements['A'].relations[0].from).to.equal(modelPlugin.statements['B']);
    (0, _chai.expect)(result.statements['A'].relations[0].status).to.equal('reconstructed');
    (0, _chai.expect)(result.statements['B']).to.exist;
    (0, _chai.expect)(result.statements['B'].relations.length).to.equal(1);
    (0, _chai.expect)(result.arguments['C']).to.exist;
    (0, _chai.expect)(result.arguments['C'].relations.length).to.equal(1);
    (0, _chai.expect)(result.arguments['C'].relations[0].type).to.equal('attack');
    (0, _chai.expect)(result.arguments['C'].relations[0].from).to.equal(modelPlugin.statements['A']);
    (0, _chai.expect)(result.arguments['C'].relations[0].to).to.equal(modelPlugin.arguments['C']);
    (0, _chai.expect)(result.arguments['C'].relations[0].status).to.equal('sketched');
  });
  it("can ignore duplicates of argument relations", function () {
    var source = '\n    [A]: text\n      + <Argument 1>\n    \n    <Argument 1>\n    \n    (1) text\n    (2) text\n    ----\n    (3) [B]: text\n      +> [A]\n    ';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(4);
    (0, _chai.expect)(Object.keys(result.arguments).length).to.equal(1);
    (0, _chai.expect)(result.relations.length).to.equal(1);
  });
  it("can create sketched argument relations", function () {
    var source = "<A>: The Beatles are the best!\n  +<B>: The Beatles made 'Rubber Soul'!\n  ->[C]: The Rolling Stones were cooler!";
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.arguments['A']).to.exist;
    (0, _chai.expect)(result.arguments['A'].relations.length).to.equal(2);
    (0, _chai.expect)(result.arguments['A'].relations[0].type).to.equal('support');
    (0, _chai.expect)(result.arguments['A'].relations[0].to).to.equal(modelPlugin.arguments['A']);
    (0, _chai.expect)(result.arguments['A'].relations[0].from).to.equal(modelPlugin.arguments['B']);
    (0, _chai.expect)(result.arguments['A'].relations[0].status).to.equal('sketched');
    (0, _chai.expect)(result.arguments['B']).to.exist;
    (0, _chai.expect)(result.arguments['B'].relations.length).to.equal(1);
    (0, _chai.expect)(result.statements['C']).to.exist;
    (0, _chai.expect)(result.statements['C'].relations.length).to.equal(1);
    (0, _chai.expect)(result.statements['C'].relations[0].type).to.equal('attack');
    (0, _chai.expect)(result.statements['C'].relations[0].from).to.equal(modelPlugin.arguments['A']);
    (0, _chai.expect)(result.statements['C'].relations[0].to).to.equal(modelPlugin.statements['C']);
    (0, _chai.expect)(result.statements['C'].relations[0].status).to.equal('sketched');
  });
  it("does not add empty statements as members to equivalence class", function () {
    var source = '[A]: B\n    \n    [A]';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.statements['A']).to.exist;
    (0, _chai.expect)(result.statements['A'].members.length).to.equal(1);
  });
  it("does not create duplicate relations for contradictions", function () {
    var source = '[A]: A\n      >< [B]: B\n    \n    [B]\n      >< [A]';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.parserErrors.length).to.equal(0);
    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(2);
    (0, _chai.expect)(Object.keys(result.relations).length).to.equal(1);
  });
  it("can parse undercuts", function () {
    var source = '[A]: A\n      _> <B>\n    \n    <B>\n      <_ [D]';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    //console.log(parserPlugin.parser.astToString(result.ast));
    //console.log(result.parserErrors[0]);
    (0, _chai.expect)(result.parserErrors.length).to.equal(0);
    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(2);
    (0, _chai.expect)(Object.keys(result.relations).length).to.equal(2);
    (0, _chai.expect)(result.relations[0].type).to.equal("undercut");
    (0, _chai.expect)(result.relations[0].from.title).to.equal("A");
    (0, _chai.expect)(result.relations[0].to.title).to.equal("B");
    (0, _chai.expect)(result.relations[1].type).to.equal("undercut");
    (0, _chai.expect)(result.relations[1].from.title).to.equal("D");
    (0, _chai.expect)(result.relations[1].to.title).to.equal("B");
  });
  it("can process a single argument", function () {
    var source = "(1) [s1]: A\n(2) [s2]: B\n----\n(3) [s3]: C";
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.arguments['Untitled 1']).to.exist;
    (0, _chai.expect)(result.statements['s1']).to.exist;
    (0, _chai.expect)(result.statements['s2']).to.exist;
    (0, _chai.expect)(result.statements['s3']).to.exist;
  });

  it("can create argument reconstructions", function () {
    var source = '<Reconstructed Argument>\n  \n  (1) [A]: text\n    -<Sketched Argument 1>\n    +[E]\n  (2) B\n  ----\n  (3) C\n  -- Modus Ponens (uses:1,2; depends on: 1) --\n  (4) [D]: text\n    ->[E]: text\n    +><Sketched Argument 1>: text\n    \n<Reconstructed Argument>\n  ->[F]: text\n  +><Sketched Argument 2>';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(Object.keys(result.arguments).length).to.equal(3);
    (0, _chai.expect)(Object.keys(result.statements).length).to.equal(6);

    var argument = result.arguments['Reconstructed Argument'];
    //console.log(util.inspect(argument));
    (0, _chai.expect)(argument).to.exist;
    (0, _chai.expect)(argument.pcs.length).to.equal(4);
    (0, _chai.expect)(argument.relations.length).to.equal(0); //all relations get transformed to relations of conclusion

    (0, _chai.expect)(argument.pcs[0].role).to.equal('premise');
    (0, _chai.expect)(argument.pcs[1].role).to.equal('premise');
    (0, _chai.expect)(argument.pcs[2].role).to.equal('conclusion');
    (0, _chai.expect)(argument.pcs[3].role).to.equal('conclusion');
    (0, _chai.expect)(result.statements[argument.pcs[0].title]).to.exist;
    (0, _chai.expect)(result.statements[argument.pcs[1].title]).to.exist;
    (0, _chai.expect)(result.statements[argument.pcs[2].title]).to.exist;
    (0, _chai.expect)(result.statements[argument.pcs[3].title]).to.exist;

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

    (0, _chai.expect)(premise.relations[1].from.title).to.equal('E');
    (0, _chai.expect)(premise.relations[1].to.title).to.equal('A');
    (0, _chai.expect)(premise.relations[1].type).to.equal('entails');
    (0, _chai.expect)(premise.relations[1].status).to.equal('reconstructed');

    (0, _chai.expect)(argument.pcs[3].title).to.equal('D');
    var conclusion = result.statements[argument.pcs[3].title];
    (0, _chai.expect)(conclusion.isUsedAsConclusion).to.be.true;
    (0, _chai.expect)(conclusion.isUsedAsPremise).to.be.false;
    (0, _chai.expect)(conclusion.isUsedAsRootOfStatementTree).to.be.false;
    (0, _chai.expect)(conclusion.isUsedAsChildOfStatementTree).to.be.false;
    (0, _chai.expect)(conclusion.relations.length).to.equal(4); //with transformed relations from the argument

    (0, _chai.expect)(conclusion.relations[0].status).to.equal('reconstructed');
    (0, _chai.expect)(conclusion.relations[0].from.title).to.equal('D');
    (0, _chai.expect)(conclusion.relations[0].to.title).to.equal('E');
    (0, _chai.expect)(conclusion.relations[0].type).to.equal('contrary');

    (0, _chai.expect)(conclusion.relations[1].status).to.equal('sketched');
    (0, _chai.expect)(conclusion.relations[1].from.title).to.equal('D');
    (0, _chai.expect)(conclusion.relations[1].to.title).to.equal('Sketched Argument 1');
    (0, _chai.expect)(conclusion.relations[1].type).to.equal('support');

    (0, _chai.expect)(conclusion.relations[2].type).to.equal("contrary");
    (0, _chai.expect)(conclusion.relations[2].from.title).to.equal("D");
    (0, _chai.expect)(conclusion.relations[2].to.title).to.equal("F");
    (0, _chai.expect)(conclusion.relations[2].status).to.equal("reconstructed");

    (0, _chai.expect)(conclusion.relations[3].type).to.equal("support");
    (0, _chai.expect)(conclusion.relations[3].from.title).to.equal("D");
    (0, _chai.expect)(conclusion.relations[3].to.title).to.equal("Sketched Argument 2");
    (0, _chai.expect)(conclusion.relations[3].status).to.equal("sketched");

    var inference = argument.pcs[3].inference;
    (0, _chai.expect)(inference).to.exist;
    (0, _chai.expect)(inference.inferenceRules.length).to.equal(1);
    (0, _chai.expect)(inference.inferenceRules[0]).to.equal('Modus Ponens');
    (0, _chai.expect)(inference.metaData['uses'].length).to.equal(2);
    (0, _chai.expect)(inference.metaData['uses'][0]).to.equal('1');
    (0, _chai.expect)(inference.metaData['uses'][1]).to.equal('2');
    (0, _chai.expect)(inference.metaData['depends on']).to.equal('1');

    var statement = result.statements['E'];
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
  it("can create the section hierarchy and set section property of statements and arguments", function () {
    var source = '# Section 1\n  \n  ## Section 2\n  \n  [A]: Text\n  \n  ### Section 3\n  \n  <B>: Text\n  \n  ## Section 4\n  \n  <B>\n  \n  (1) p\n  (2) q\n  ----\n  (3) r\n  ';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    //console.log(JSON.stringify(result.sections,null,2));
    (0, _chai.expect)(result.sections).to.exist;
    (0, _chai.expect)(result.sections.length).to.equal(1);
    (0, _chai.expect)(result.sections[0].title).to.equal('Section 1');
    (0, _chai.expect)(result.sections[0].children).to.exist;
    (0, _chai.expect)(result.sections[0].children.length).to.equal(2);
    (0, _chai.expect)(result.sections[0].children[0].title).to.equal('Section 2');
    (0, _chai.expect)(result.sections[0].children[0].children.length).to.equal(1);
    (0, _chai.expect)(result.sections[0].children[0].children[0].title).to.equal('Section 3');
    (0, _chai.expect)(result.sections[0].children[0].children[0].children.length).to.equal(0);
    (0, _chai.expect)(result.sections[0].children[1].title).to.equal('Section 4');
    (0, _chai.expect)(result.sections[0].children[1].children.length).to.equal(0);

    (0, _chai.expect)(result.statements['A']).to.exist;
    (0, _chai.expect)(result.statements['A'].members[0].section).to.exist;
    (0, _chai.expect)(result.statements['A'].members[0].section.title).to.equal('Section 2');

    (0, _chai.expect)(result.arguments['B']).to.exist;
    (0, _chai.expect)(result.arguments['B'].section).to.exist;
    (0, _chai.expect)(result.arguments['B'].section.title).to.equal('Section 4');
    (0, _chai.expect)(result.arguments['B'].descriptions[0].section).to.exist;
    (0, _chai.expect)(result.arguments['B'].descriptions[0].section.title).to.equal('Section 3');
  });
  it("can create tags lists", function () {
    var source = '[Statement 1]: #tag-1 text\n  \n  [Statement 2]: text #tag-1 #(tag 2)\n  \n  <Argument 1>: text #tag-1 #tag3 #tag4\n  \n  [Statement 1]: #tag-5 #tag-6 \n  ';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.tags).to.exist;
    (0, _chai.expect)(result.tags.length).to.equal(6);
    (0, _chai.expect)(result.statements["Statement 1"].tags.length).to.equal(3);
    (0, _chai.expect)(result.statements["Statement 2"].members[result.statements["Statement 2"].members.length - 1].text).to.equal("text #tag-1 #(tag 2)");
    (0, _chai.expect)(result.statements["Statement 2"].tags.length).to.equal(2);
    (0, _chai.expect)(result.arguments["Argument 1"].tags.length).to.equal(3);
  });
  it("can identify duplicates in outgoing relations of reconstructed argument and main conclusion", function () {
    var source = '<A1>: A1\n  - <A2>: A2\n    \n<A2>\n\n (1) P\n (2) P\n ----\n (3) C\n   -> <A1> \n  ';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.relations).to.exist;
    (0, _chai.expect)(result.relations.length).to.equal(1);
  });
  it("can create section titles from headings with mentions, tags and ranges", function () {
    var source = '# @[A] @<B> #tag **bold** _italic_\n  \n  [A]\n  \n  <B>\n  ';
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.sections).to.exist;
    (0, _chai.expect)(result.sections.length).to.equal(1);
    (0, _chai.expect)(result.sections[0].title).to.equal("@[A] @<B> #tag bold italic");
    (0, _chai.expect)(result.sections[0].tags.length).to.equal(1);
    (0, _chai.expect)(result.sections[0].ranges.length).to.equal(5);
    (0, _chai.expect)(result.arguments['B']).to.exist;
    (0, _chai.expect)(result.statements['A']).to.exist;
  });
  it("can parse escaped chars", function () {
    var source = _fs2.default.readFileSync("./test/model-escaped-chars.argdown", 'utf8');

    //let source = `[A]: \\[text\\] text`;
    var result = app.run(['parse-input', 'build-model'], { input: source });
    (0, _chai.expect)(result.statements['A']).to.exist;
    (0, _chai.expect)(result.statements['A'].getCanonicalText()).to.equal('[text] text');
  });
  it("can return error with token location for incomplete reconstruction", function () {
    var source = 'sdsadad\n\n(1) adasdasd';
    var result = app.run(['parse-input'], { input: source });
    //console.log(result.parserErrors[0]);
    (0, _chai.expect)(result.parserErrors[0].previousToken.startLine).to.equal(3);
    (0, _chai.expect)(result.parserErrors[0].previousToken.startColumn).to.equal(5);
  });
});
//# sourceMappingURL=ModelPlugin.spec.js.map