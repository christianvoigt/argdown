import { expect } from "chai";
import { AsyncArgdownApplication } from "../src/index";
import { IArgdownRequest, IArgdownResponse } from "@argdown/core";
import * as path from "path";

const app = new AsyncArgdownApplication();

describe("AsyncArgdownApplication", function() {
  it("can run async", function() {
    let plugin1 = {
      name: "TestPlugin2",
      runAsync: (_request: IArgdownRequest, response: IArgdownResponse) => {
        return new Promise(resolve => {
          setTimeout(() => {
            (<any>response).asyncRunCompleted = true;
            resolve(response);
          }, 500);
        });
      }
    };
    let plugin2 = {
      name: "TestPlugin1",
      run({}, response: IArgdownResponse) {
        if ((<any>response).asyncRunCompleted) {
          (<any>response).syncRunCompleted = true;
        }
        return response;
      }
    };
    app.addPlugin(plugin1, "test");
    app.addPlugin(plugin2, "test");
    return app.runAsync({ process: ["test"], input: "Hallo Welt!" }).then(response => {
      expect((<any>response).asyncRunCompleted).to.be.true;
      expect((<any>response).syncRunCompleted).to.be.true;
    });
  });
  it("can load json config", async () => {
    const config = await app.loadConfig(path.resolve(__dirname + "/argdown.config.json"));
    expect(config.input).to.equal("Hallo World!");
  });
  it("can load js config with config as default export", async () => {
    const config = await app.loadConfig(path.resolve(__dirname + "/argdown.config.js"));
    expect(config.input).to.equal("Hallo World!");
  });
  it("can load js config with config as property of default export", async () => {
    const config = await app.loadConfig(path.resolve(__dirname + "/argdown2.config.js"));
    expect(config.input).to.equal("Hallo World!");
  });
});
