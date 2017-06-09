import { expect } from 'chai';
import {ArgdownApplication, ParserPlugin, ModelPlugin, JSONExport} from '../src/index.js';

let app = new ArgdownApplication();
let parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');
let modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin, 'build-model');
let jsonExport = new JSONExport();
app.addPlugin(jsonExport, 'export-json');

describe("JSONExport", function() {

  it("sanity test", function(){
    let source = "[Test]: Hello _World_!\n  +<Argument 1>\n    -[Test]\n\n[Test]: Tschüss!";
    let result = app.run(['parse-input','build-model','export-json'],{input:source});
    expect(result.json).to.exist;
  });
});
