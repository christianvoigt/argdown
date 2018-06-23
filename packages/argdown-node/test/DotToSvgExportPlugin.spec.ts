import { expect } from "chai";
import { argdown } from "../src/index";
import { IArgdownRequest } from "@argdown/core";
describe("DotToSvgExportPlugin", () => {
  it("can generate svg from dot (sanity test)", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["parse-input", "build-model", "build-map", "export-dot", "export-svg"],
      logLevel: "error"
    };
    const response = await argdown.runAsync(request);
    expect(response.svg).to.exist;
  });
});
