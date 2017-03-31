import { expect } from 'chai';
import {ArgdownApplication} from '../src/index.js';

let app = new ArgdownApplication();

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
    app.addPlugin(plugin);
    expect(app.getPlugin(plugin.name)).to.equal(plugin);
    app.parse(source);
    let result = app.run();
    expect(statements).to.equal(1);
    expect(result.testRunCompleted).to.be.true;
    statements = 0;
    app.removePlugin(plugin);
    app.parse(source);
    result = app.run();
    expect(statements).to.equal(0);
    expect(result.testRunCompleted).to.be.undefined;
  });
});
