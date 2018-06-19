import { expect } from "chai";
import { ArgdownApplication, ParserPlugin } from "../src/index";
import { IArgdownRequest } from "../src/IArgdownRequest";
import { IArgdownResponse } from "../src/IArgdownResponse";
import { ArgdownPluginError } from "../src/ArgdownPluginError";

const app = new ArgdownApplication();
const parserPlugin = new ParserPlugin();
app.addPlugin(parserPlugin, "parse-input");

describe("Application", function() {
  it("can add, get, call and remove plugins", function() {
    let source = "Hello World!";
    let statements = 0;
    let plugin = {
      name: "TestPlugin",
      ruleListeners: {
        statementEntry: () => statements++
      },
      run: (request: IArgdownRequest, response: IArgdownResponse) => {
        (<any>response).testRunCompleted = true;
        throw new ArgdownPluginError("TestPlugin", "Test error.");
      }
    };
    app.addPlugin(plugin, "test");
    expect(app.getPlugin(plugin.name, "test")).to.equal(plugin);
    let result = app.run({ process: ["parse-input", "test"], input: source, logExceptions: false });
    expect(statements).to.equal(1);
    expect(result.exceptions!.length).to.equal(1);
    expect((<ArgdownPluginError>result.exceptions![0]).plugin).to.equal("TestPlugin");
    expect((<any>result).testRunCompleted).to.be.true;
    statements = 0;
    app.removePlugin(plugin, "test");
    result = app.run({ process: ["parse-input", "test"], input: source, logExceptions: false });
    expect(statements).to.equal(0);
    expect((<any>result).testRunCompleted).to.be.undefined;
  });
});
