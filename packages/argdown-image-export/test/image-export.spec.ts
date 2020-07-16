import { describe, it } from "mocha";
import { expect } from "chai";
import { argdown } from "@argdown/node";
import { installImageExport } from "../src";
// argdown.addPlugin(new ImageExportPlugin({ format: "png" }), "export-png");
// argdown.addPlugin(new ImageExportPlugin({ format: "jpg" }), "export-jpg");
// argdown.addPlugin(new ImageExportPlugin({ format: "webp" }), "export-webp");
installImageExport(argdown);
describe("ExportImagePlugin", async function() {
  it("Can export to png", async function() {
    const process = [
      "parse-input",
      "build-model",
      "build-map",
      "transform-closed-groups",
      "colorize",
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
