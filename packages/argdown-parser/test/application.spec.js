import { expect } from 'chai';
import {ArgdownApplication, ParserPlugin} from '../src/index.js';

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, 'parse-input');

describe("Application", function() {
  it("can add, get, call and remove plugins", function(){
    let source = "Hello World!";
    let statements = 0;
    let plugin = {
      name: "TestPlugin",
      argdownListeners : {
        statementEntry: ()=>statements++
      },
      run(data){
        data.testRunCompleted = true;
        return data;
      }
    };
    app.addPlugin(plugin, 'test');
    expect(app.getPlugin(plugin.name, 'test')).to.equal(plugin);
    let result = app.run(['parse-input','test'],{input:source});
    expect(statements).to.equal(1);
    expect(result.testRunCompleted).to.be.true;
    statements = 0;
    app.removePlugin(plugin, 'test');
    result = app.run(['parse-input','test'],{input:source});
    expect(statements).to.equal(0);
    expect(result.testRunCompleted).to.be.undefined;
  });
});
