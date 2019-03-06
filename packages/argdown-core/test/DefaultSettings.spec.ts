import { expect } from "chai";
import { DefaultSettings, ensure, mergeDefaults } from "../src";
import { isObject } from "util";

describe("DefaultSettings", function() {
  it("can create default settings with nested ensure.object merge functions", function() {
    interface ITestSettings {
      obj: {
        obj: {
          str: string;
        };
        nr: number;
      };
      bool: boolean;
    }
    const defaults: DefaultSettings<ITestSettings> = {
      obj: ensure.object({
        obj: ensure.object({
          str: "Hallo world!"
        }),
        nr: 1
      }),
      bool: true
    };
    const settings = mergeDefaults({}, defaults);
    expect(isObject(settings.obj)).to.be.true;
    expect(isObject(settings.obj.obj)).to.be.true;
    expect(settings.obj.obj.str).to.equal("Hallo world!");
    expect(settings.obj.nr).to.equal(1);
    expect(settings.bool).to.be.true;
  });
  it("can merge default settings with config settings", function() {
    interface ITestSettings {
      obj: {
        obj: {
          str: string;
        };
        nr: number;
      };
      bool: boolean;
    }
    const defaults: DefaultSettings<ITestSettings> = {
      obj: ensure.object({
        obj: ensure.object({
          str: "Hallo world!"
        }),
        nr: 1
      }),
      bool: true
    };
    const settings = mergeDefaults(
      { obj: { obj: { str: "Hallo universe!" } } },
      defaults
    );
    expect(isObject(settings.obj)).to.be.true;
    expect(isObject(settings.obj.obj)).to.be.true;
    expect(settings.obj.obj.str).to.equal("Hallo universe!");
    expect(settings.obj.nr).to.equal(1);
    expect(settings.bool).to.be.true;
  });
  it("can overwrite config settings with default settings", function() {
    interface ITestSettings {
      obj: {
        obj: {
          str: string;
        };
        nr: number;
      };
      bool: boolean;
    }
    const defaults: DefaultSettings<ITestSettings> = {
      obj: ensure.object({
        obj: ensure.object({
          str: "Hallo world!"
        }),
        nr: 1
      }),
      bool: true
    };
    const settings = mergeDefaults({ obj: "Hallo universe!" }, defaults);
    expect(isObject(settings.obj)).to.be.true;
    expect(isObject(settings.obj.obj)).to.be.true;
    expect(settings.obj.obj.str).to.equal("Hallo world!");
    expect(settings.obj.nr).to.equal(1);
    expect(settings.bool).to.be.true;
  });
});
