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
  HighlightSourcePlugin,
  WebComponentExportPlugin
} from "../src";
import { SyncDotToSvgExportPlugin } from "../src/plugins/SyncDotToSvgExportPlugin";
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
  app.addPlugin(new HighlightSourcePlugin(), "highlight-source");
  app.addPlugin(new WebComponentExportPlugin(), "export-web-component");
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
        "create-map",
        "add-colors",
        "export-dot",
        "export-dot-as-svg",
        "highlight-source",
        "export-web-component"
      ],
      logLevel: "error"
    };
    const response = await app.run(request);
    console.log(response.webComponent);
    expect(response.webComponent).to.exist;
  });
});
