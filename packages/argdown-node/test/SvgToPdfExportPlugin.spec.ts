import { expect } from "chai";
const chai = require("chai");
chai.use(require("chai-fs"));
import { describe, it } from "mocha";
import { argdown } from "../src/index";
import { IArgdownRequest } from "@argdown/core";
import path from "path";
import rimraf from "rimraf";
const rimrafPromise = function(path: string) {
  return new Promise<void>((resolve, reject) => {
    rimraf(path, {}, function(err: Error | null | undefined) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

describe("SvgToPdfExportPlugin", () => {
  it("can generate pdf from svg (sanity test)", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      svgToPdf: {
        fileName: "test",
        outputDir: "test/pdf"
      },
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "colorize",
        "export-dot",
        "export-svg",
        "save-svg-as-pdf"
      ],
      logLevel: "error"
    };
    await argdown.runAsync(request);
    const filePathToPdf = path.resolve(__dirname, "pdf/test.pdf");
    (<any>expect(filePathToPdf).to.be.a).file();
    await rimrafPromise(path.resolve(__dirname, "pdf/"));
  });
  it("can load custom font (sanity test)", async () => {
    const input = `
    ===
    svgToPdf:
        fonts:
            - {name: "arial", path: "./DejaVuSans.ttf"}
            - {name: "arial Bold", path: "./DejaVuSans-Bold.ttf"}
            - {name: "Times,serif", path: "./DejaVuSans.ttf"}
    ===

        [B]: ДҖЛ̕

        <A>: ДҖЛ̕
            - [B]
            + <C>: ДҖЛ̕
        `;
    const request: IArgdownRequest = {
      input,
      inputPath: path.resolve(__dirname, "test-font.argdown"),
      svgToPdf: {
        fileName: "test-font",
        outputDir: "test/pdf"
      },
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "colorize",
        "export-dot",
        "export-svg",
        "save-svg-as-pdf"
      ],
      logLevel: "error"
    };
    await argdown.runAsync(request);
    const filePathToPdf = path.resolve(__dirname, "pdf/test-font.pdf");
    (<any>expect(filePathToPdf).to.be.a).file();
    await rimrafPromise(path.resolve(__dirname, "pdf/"));
  });
});
