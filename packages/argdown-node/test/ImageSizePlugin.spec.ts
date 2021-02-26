import { expect } from "chai";
import { describe, it } from "mocha";
import { argdown } from "../src/index";
import { IArgdownRequest } from "@argdown/core";
describe("ImageSizePlugin", function(){
    this.timeout(20000);

  it("can set image size from local file", async () => {
    const input = `
        <A>: test {images: ["./argdown-mark.svg"]}
            - [B]
        `;
    const request: IArgdownRequest = {
      input,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "add-images"
      ],
      logLevel: "error"
    };

    await argdown.runAsync(request);
    expect(request.images).to.exist;
    expect(request.images!.files).to.exist;
    expect(request.images!.files!["./argdown-mark.svg"]).to.exist;
    expect(request.images!.files!["./argdown-mark.svg"].width).to.equal(208);
    expect(request.images!.files!["./argdown-mark.svg"].height).to.equal(128);
  });
  it("can set image size from url", async () => {
    const url = "https://github.com/christianvoigt/argdown/blob/master/argdown-arrow.png?raw=true";

    const input = `
        <A>: test {images: ["${url}"]}
            - [B]
        `;
    const request: IArgdownRequest = {
      input,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "add-images"
      ],
      logLevel: "error"
    };

    await argdown.runAsync(request);
    expect(request.images).to.exist;
    expect(request.images!.files).to.exist;
    expect(request.images!.files![url]).to.exist;
    expect(request.images!.files![url].width).to.equal(260);
    expect(request.images!.files![url].height).to.equal(260);
  });
});
