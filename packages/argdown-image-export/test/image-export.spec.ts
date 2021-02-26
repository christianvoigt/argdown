import { describe, it } from "mocha";
import { expect } from "chai";
import { argdown } from "@argdown/node";
import { installImageExport } from "../src";
import path from "path";
// argdown.addPlugin(new ImageExportPlugin({ format: "png" }), "export-png");
// argdown.addPlugin(new ImageExportPlugin({ format: "jpg" }), "export-jpg");
// argdown.addPlugin(new ImageExportPlugin({ format: "webp" }), "export-webp");
installImageExport(argdown);
describe("ExportImagePlugin", async function() {
  this.timeout(20000);
  it("Can export to png", async function() {
    const process = [
      "parse-input",
      "build-model",
      "build-map",
      "transform-closed-groups",
      "colorize",
      "add-images",
      "export-dot",
      "export-svg",
      "export-png"
    ];
    const input = `
[s1]: Test
    <- <a1>: some argument
`;
    const request = {
      process,
      input
    };
    const response = await argdown.runAsync(request);
    console.log(response.png);
    expect(response.png).to.exist;
  });
  //   it("Can save as png", async function() {
  //     const process = [
  //       "parse-input",
  //       "build-model",
  //       "build-map",
  //       "transform-closed-groups",
  //       "colorize",
  //       "export-dot",
  //       "export-svg",
  //       "export-png",
  //       "save-as-png"
  //     ];
  //     const input = `
  // [s1]: Test
  //     <- <a1>: some argument
  // `;
  //     const request = {
  //       process,
  //       input,
  //       saveAs: { outputDir: "./test/images", fileName: "test" }
  //     };
  //     const response = await argdown.runAsync(request);
  //     console.log(response.png);
  //     expect(response.png).to.exist;
  //   });
  it("Can export to jpg", async function() {
    const process = [
      "parse-input",
      "build-model",
      "build-map",
      "transform-closed-groups",
      "colorize",
      "export-dot",
      "export-svg",
      "export-jpg"
    ];
    const input = `
[s1]: Test
    <- <a1>: some argument
`;
    const request = { process, input };
    const response = await argdown.runAsync(request);
    console.log(response.jpg);
    expect(response.jpg).to.exist;
  });
  it("Can export to jpg with node image", async function() {
    const process = [
      "parse-input",
      "build-model",
      "build-map",
      "transform-closed-groups",
      "colorize",
      "add-images",
      "export-dot",
      "export-svg",
      "export-jpg"
      //"save-as-jpg" //uncomment to view image (will be saved in ../images/default.jpg)
    ];
    const input = `
===
images:
    convertToDataUrls: true
    files:
      cat: {path: "cat1.jpg", width: 100, height: 100}
===

[s1]: Test #cat
    <- <a1>: some argument
`;
    console.log(__dirname);
    const request = {
      process,
      input,
      logLevel: "verbose",
      inputPath: path.resolve(__dirname, "test-node-image.argdown")
    };
    const response = await argdown.runAsync(request);
    console.log(response.jpg);
    expect(response.jpg).to.exist;
  });
  it("Can export to webp", async function() {
    const process = [
      "parse-input",
      "build-model",
      "build-map",
      "transform-closed-groups",
      "colorize",
      "export-dot",
      "export-svg",
      "export-webp"
    ];
    const input = `
[s1]: Test
    <- <a1>: some argument
`;
    const request = { process, input };
    const response = await argdown.runAsync(request);
    console.log(response.webp);
    expect(response.webp).to.exist;
  });
});
