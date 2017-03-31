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
      },
      run: function run(data) {
        data.testRunCompleted = true;
        return data;
      }
    };
    app.addPlugin(plugin);
    (0, _chai.expect)(app.getPlugin(plugin.name)).to.equal(plugin);
    app.parse(source);
    var result = app.run();
    (0, _chai.expect)(statements).to.equal(1);
    (0, _chai.expect)(result.testRunCompleted).to.be.true;
    statements = 0;
    app.removePlugin(plugin);
    app.parse(source);
    result = app.run();
    (0, _chai.expect)(statements).to.equal(0);
    (0, _chai.expect)(result.testRunCompleted).to.be.undefined;
  });
});
//# sourceMappingURL=application.spec.js.map