import { expect } from "chai";
import { argdown } from "../src/index";
import { IArgdownRequest } from "@argdown/core";
describe("HighlightSourcePlugin", () => {
  it("can generate highlighted source html (sanity test)", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["parse-input", "build-model", "highlight-source"],
      logLevel: "error"
    };
    const response = await argdown.runAsync(request);
    // console.log(response.highlightedSource);
    expect(response.highlightedSource).to.exist;
  });
});
