import { expect } from "chai";
import { argdown } from "../src/index";
import { IArgdownRequest } from "@argdown/core";
import * as intercept from "intercept-stdout";
describe("StdoutPlugin", () => {
  it("can write dot to stdout", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["parse-input", "build-model", "build-map", "export-dot", "stdout-dot"],
      logLevel: "error"
    };
    let capturedText = "";

    var unhook_intercept = intercept(function(text: string) {
      capturedText += text;
      return "";
    });
    await argdown.runAsync(request);
    unhook_intercept();
    expect(capturedText).to.not.equal("");
    expect(capturedText.indexOf('digraph "Argument Map"')).to.not.equal(-1);
  });
  it("can write html to stdout", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["parse-input", "build-model", "export-html", "stdout-html"],
      logLevel: "error"
    };
    let capturedText = "";

    var unhook_intercept = intercept(function(text: string) {
      capturedText += text;
      return "";
    });
    await argdown.runAsync(request);
    unhook_intercept();
    expect(capturedText).to.not.equal("");
    expect(capturedText.indexOf("<html")).to.not.equal(-1);
  });
  it("can write json to stdout", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["parse-input", "build-model", "export-json", "stdout-json"],
      logLevel: "error"
    };
    let capturedText = "";

    var unhook_intercept = intercept(function(text: string) {
      capturedText += text;
      return "";
    });
    await argdown.runAsync(request);
    unhook_intercept();
    expect(capturedText).to.not.equal("");
    expect(capturedText.startsWith(`{`)).to.be.true;
    expect(capturedText.endsWith(`}`)).to.be.true;
  });
  it("can write svg to stdout", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["parse-input", "build-model", "build-map", "export-dot", "export-svg", "stdout-svg"],
      logLevel: "verbose"
    };
    let capturedText = "";

    var unhook_intercept = intercept(function(text: string) {
      capturedText += text;
      return "";
    });
    await argdown.runAsync(request);
    unhook_intercept();
    expect(capturedText).to.not.equal("");
    expect(capturedText.indexOf(`<svg`)).to.not.equal(-1);
  });
});
