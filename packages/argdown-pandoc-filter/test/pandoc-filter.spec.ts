const util = require("util");
const exec = util.promisify(require("child_process").exec);
import rimraf from "rimraf";
import path from "path";
import { use, expect } from "chai";
import chaiFs from "chai-fs";
use(chaiFs);
import "mocha";
const chaiSnapshot = require("mocha-chai-snapshot");
use(chaiSnapshot);

// const tis = this;
async function execPandocOnFile(fileName: string, format: "html" | "pdf") {
  const { stdout } = await exec(
    `pandoc -s -f markdown test/${fileName} --filter dist/index.js -t ${format}`
  );
  return String(stdout);
}
const rimrafPromise = function(path: string) {
  return new Promise((resolve, reject) => {
    rimraf(path, {}, function(err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

describe("Argdown Pandoc Filter", function() {
  this.timeout(50000);
  it("generates html with web-component", async () => {
    const output = await execPandocOnFile(`example-web-component.md`, "html");
    (expect(output) as any).to.matchSnapshot(this);
  });
  it("generates html with inline image", async () => {
    const output = await execPandocOnFile(`example-inline-jpg.md`, "html");
    (expect(output) as any).to.matchSnapshot(this);
  });
  it("generates html with jpg image", async () => {
    let imagesFolder = path.resolve(__dirname, "./images/");
    let filePathToImage = path.resolve(imagesFolder, "map-1.jpg");
    await rimrafPromise(imagesFolder);
    const output = await execPandocOnFile(`example-file-jpg.md`, "html");
    (expect(output) as any).to.matchSnapshot(this);
    (<any>expect(filePathToImage).to.be.a).file();
    await rimrafPromise(imagesFolder);
  });
  it("generates html with png image", async () => {
    let imagesFolder = path.resolve(__dirname, "./images/");
    let filePathToImage = path.resolve(imagesFolder, "map-1.png");
    await rimrafPromise(imagesFolder);
    const output = await execPandocOnFile(`example-file-png.md`, "html");
    (expect(output) as any).to.matchSnapshot(this);
    (<any>expect(filePathToImage).to.be.a).file();
    await rimrafPromise(imagesFolder);
  });
  it("generates html with webp image", async () => {
    let imagesFolder = path.resolve(__dirname, "./images/");
    let filePathToImage = path.resolve(imagesFolder, "map-1.webp");
    await rimrafPromise(imagesFolder);
    const output = await execPandocOnFile(`example-file-webp.md`, "html");
    (expect(output) as any).to.matchSnapshot(this);
    (<any>expect(filePathToImage).to.be.a).file();
    await rimrafPromise(imagesFolder);
  });
  it("generates pdf with inline image", async () => {
    const output = await execPandocOnFile(`example-inline-jpg.md`, "pdf");
    //(expect(output) as any).to.matchSnapshot(this); // not working
    expect(output).to.exist;
    expect(output).to.not.be.empty;
  });
});
