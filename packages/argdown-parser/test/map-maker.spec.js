import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor,MapMaker} from '../src/index.js';

let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor,'preprocessor');
let mapMaker = new MapMaker();
app.addPlugin(mapMaker, "make-map");

describe("MapMaker", function() {
  it("can create map from one statement and two argument definitions", function(){
    let source = "<Argument 1>\n  + [Statement 1]: Hello World!\n    +<Argument 2>: Description";
    app.parse(source);
    let result = app.run(['preprocessor','make-map']);
    console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);

    expect(result.map.statementNodes["Statement 1"]).to.exist;
    expect(result.map.argumentNodes["Argument 1"]).to.exist;
    expect(result.map.argumentNodes["Argument 2"]).to.exist;
    expect(result.map.relations.length).to.equal(2);
  });
  it("can create a map from two argument reconstructions", function(){
    let source = "<Argument 1>\n\n  (1)[Statement 1]: A\n  (2)[Statement 2]: B\n  ----\n  (3)[Statement 2]: C"+
    "\n\n<Argument 2>\n\n  (1)[Statement 4]: A\n  (2)[Statement 5]: B\n  ----\n  (3)[Statement 6]: C\n  ->[Statement 1]";
    app.parse(source);
    let result = app.run(['preprocessor','make-map']);
    //console.log(JSON.stringify(result.map, null, 2));
    //app.parser.logAst(result.ast);
    //preprocessor.logRelations(result);

    expect(result.map.argumentNodes["Argument 1"]).to.exist;
    expect(result.map.argumentNodes["Argument 2"]).to.exist;
    expect(result.map.relations.length).to.equal(1);
    expect(result.map.relations[0].type).to.equals("attack");
    expect(result.map.relations[0].from.title).to.equals("Argument 2");
    expect(result.map.relations[0].to.title).to.equals("Argument 1");

  });
});
