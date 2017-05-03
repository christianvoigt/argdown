import { expect } from 'chai';
import {ArgdownApplication, ArgdownPreprocessor, JSONExport} from '../src/index.js';

let app = new ArgdownApplication();
let preprocessor = new ArgdownPreprocessor();
app.addPlugin(preprocessor);
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
