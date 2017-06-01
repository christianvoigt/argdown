import { expect } from 'chai';
import {ArgdownApplication, ModelPlugin, JSONExport} from '../src/index.js';

let app = new ArgdownApplication();
let modelPlugin = new ModelPlugin();
app.addPlugin(modelPlugin);
let jsonExport = new JSONExport();
app.addPlugin(jsonExport);

describe("JSONExport", function() {

  it("sanity test", function(){
    let source = "[Test]: Hello _World_!\n  +<Argument 1>\n    -[Test]\n\n[Test]: Tschüss!";
    app.parse(source);
    let result = app.run();
    expect(result.json).to.exist;
  });
});
