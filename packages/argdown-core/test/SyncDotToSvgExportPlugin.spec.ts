import { expect } from "chai";
import { it, describe } from "mocha";
import {
  IArgdownRequest,
  ArgdownApplication,
  ParserPlugin,
  ModelPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  MapPlugin,
  GroupPlugin,
  ColorPlugin,
  DotExportPlugin,
  SyncDotToSvgExportPlugin
} from "../src";
describe("WebComponentExportPlugin", function() {
  const app = new ArgdownApplication();
  app.addPlugin(new ParserPlugin(), "parse-input");
  app.addPlugin(new ModelPlugin(), "build-model");
  app.addPlugin(new PreselectionPlugin(), "create-map");
  app.addPlugin(new StatementSelectionPlugin(), "create-map");
  app.addPlugin(new ArgumentSelectionPlugin(), "create-map");
  app.addPlugin(new MapPlugin(), "create-map");
  app.addPlugin(new GroupPlugin(), "create-map");
  app.addPlugin(new ColorPlugin(), "add-colors");
  app.addPlugin(new DotExportPlugin(), "export-dot");
  app.addPlugin(new SyncDotToSvgExportPlugin(), "export-dot-as-svg");
  it("can generate svg (sanity test)", async () => {
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
        "create-map",
        "add-colors",
        "export-dot",
        "export-dot-as-svg"
      ],
      logLevel: "error"
    };
    const response = await app.run(request);
    console.log(response.svg);
    expect(response.svg).to.exist;
  });
});
