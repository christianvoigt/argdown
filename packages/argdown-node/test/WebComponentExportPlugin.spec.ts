import { expect } from "chai";
import { argdown } from "../src/index";
import { IArgdownRequest } from "@argdown/core";
describe("WebComponentExportPlugin", function() {
  this.timeout(20000);
  it("can generate component html (sanity test)", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "export-dot",
        "export-svg",
        "highlight-source",
        "export-web-component"
      ],
      logLevel: "error"
    };
    const response = await argdown.runAsync(request);
    // console.log(response.webComponent);
    expect(response.webComponent).to.exist;
  });
});
