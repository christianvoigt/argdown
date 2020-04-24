import { expect } from "chai";
import { describe, it } from "mocha";
import {
  IArgdownRequest,
  ArgdownApplication,
  HighlightSourcePlugin
} from "../src/index";
describe("HighlightSourcePlugin", () => {
  const app = new ArgdownApplication();
  app.addPlugin(new HighlightSourcePlugin(), "highlight-source");
  it("can generate highlighted source html (sanity test)", async () => {
    const input = `
        [B]: test

        <A>: test
            - [B]
            + <C>: test
        `;
    const request: IArgdownRequest = {
      input,
      process: ["highlight-source"],
      logLevel: "error"
    };
    const response = app.run(request);
    // console.log(response.highlightedSource);
    expect(response.highlightedSource).to.exist;
  });
});
