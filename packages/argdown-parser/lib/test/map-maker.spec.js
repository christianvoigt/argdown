'use strict';

var _chai = require('chai');

var _index = require('../src/index.js');

var app = new _index.ArgdownApplication();
var preprocessor = new _index.ArgdownPreprocessor();
app.addPlugin(preprocessor, 'preprocessor');
var mapMaker = new _index.MapMaker();
app.addPlugin(mapMaker, "make-map");

describe("MapMaker", function () {
  it("can create map from one statement and two argument definitions", function () {
    var source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
    app.parse(source);
    var result = app.run(['preprocessor', 'make-map']);
    console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);

    (0, _chai.expect)(result.map.statementNodes["Statement 1"]).to.exist;
    (0, _chai.expect)(result.map.argumentNodes["Argument 1"]).to.exist;
    (0, _chai.expect)(result.map.argumentNodes["Argument 2"]).to.exist;
    (0, _chai.expect)(result.map.relations.length).to.equal(2);
  });
  it("can create a map from two argument reconstructions", function () {
    var source = "<Argument 1>\n\n  (1)[Statement 1]: A\n  (2)[Statement 2]: B\n  ----\n  (3)[Statement 2]: C" + "\n\n<Argument 2>\n\n  (1)[Statement 4]: A\n  (2)[Statement 5]: B\n  ----\n  (3)[Statement 6]: C\n  ->[Statement 1]";
    app.parse(source);
    var result = app.run(['preprocessor', 'make-map']);
    //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);

    (0, _chai.expect)(result.map.argumentNodes["Argument 1"]).to.exist;
    (0, _chai.expect)(result.map.argumentNodes["Argument 2"]).to.exist;
    (0, _chai.expect)(result.map.relations.length).to.equal(1);
    (0, _chai.expect)(result.map.relations[0].type).to.equals("attack");
    (0, _chai.expect)(result.map.relations[0].from.title).to.equals("Argument 2");
    (0, _chai.expect)(result.map.relations[0].to.title).to.equals("Argument 1");
  });
});
//# sourceMappingURL=map-maker.spec.js.map