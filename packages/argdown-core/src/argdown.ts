import { ArgdownApplication } from "./ArgdownApplication";
import { ParserPlugin } from "./plugins/ParserPlugin";
import { ModelPlugin } from "./plugins/ModelPlugin";
import { PreselectionPlugin } from "./plugins/PreselectionPlugin";
import { StatementSelectionPlugin } from "./plugins/StatementSelectionPlugin";
import { ArgumentSelectionPlugin } from "./plugins/ArgumentSelectionPlugin";
import { MapPlugin } from "./plugins/MapPlugin";
import { GroupPlugin } from "./plugins/GroupPlugin";
import { ColorPlugin } from "./plugins/ColorPlugin";
import { DotExportPlugin } from "./plugins/DotExportPlugin";
import { SyncDotToSvgExportPlugin } from "./plugins/SyncDotToSvgExportPlugin";
import { HighlightSourcePlugin } from "./plugins/HighlightSourcePlugin";
import { RegroupPlugin } from "./plugins/RegroupPlugin";
import { DataPlugin } from "./plugins/DataPlugin";
import { ClosedGroupPlugin } from "./plugins/ClosedGroupPlugin";
import { HtmlExportPlugin } from "./plugins/HtmlExportPlugin";
import { JSONExportPlugin } from "./plugins/JSONExportPlugin";
import { GraphMLExportPlugin } from "./plugins/GraphMLExportPlugin";
import { WebComponentExportPlugin } from "./plugins/WebComponentExportPlugin";
import { ExplodeArgumentsPlugin } from "./plugins/ExplodeArgumentsPlugin";

/***
 * Default instance of a sync ArgdownApplication with all plugins of @argdown/core loaded and default processes defined.
 *
 * If you are using Argdown in node and can use async processes use the AsyncArgdownApplication instance provided by @argdown/node instead.
 */
export const argdown = new ArgdownApplication();
argdown.addPlugin(new ParserPlugin(), "parse-input");
argdown.addPlugin(new DataPlugin(), "build-model");
argdown.addPlugin(new ModelPlugin(), "build-model");
argdown.addPlugin(new ExplodeArgumentsPlugin(), "build-model");
argdown.addPlugin(new RegroupPlugin(), "build-model");
argdown.addPlugin(new PreselectionPlugin(), "build-map");
argdown.addPlugin(new StatementSelectionPlugin(), "build-map");
argdown.addPlugin(new ArgumentSelectionPlugin(), "build-map");
argdown.addPlugin(new MapPlugin(), "build-map");
argdown.addPlugin(new GroupPlugin(), "build-map");
argdown.addPlugin(new ClosedGroupPlugin(), "transform-closed-groups");
argdown.addPlugin(new ColorPlugin(), "colorize");
argdown.addPlugin(new HtmlExportPlugin(), "export-html");
argdown.addPlugin(new JSONExportPlugin(), "export-json");
argdown.addPlugin(new DotExportPlugin(), "export-dot");
argdown.addPlugin(new GraphMLExportPlugin(), "export-graphml");
argdown.addPlugin(new SyncDotToSvgExportPlugin(), "export-svg");
argdown.addPlugin(new HighlightSourcePlugin(), "highlight-source");
argdown.addPlugin(new WebComponentExportPlugin(), "export-web-component");

argdown.defaultProcesses = {
  "export-svg": [
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "export-dot",
    "export-svg"
  ],
  "export-dot": [
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "export-dot"
  ],
  "export-graphml": [
    "parse-input",
    "build-model",
    "build-map",
    "colorize",
    "export-graphml"
  ],
  "export-json": [
    "parse-input",
    "build-model",
    "build-map",
    "colorize",
    "export-json"
  ],
  "export-html": ["parse-input", "build-model", "colorize", "export-html"],
  "export-web-component": [
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "export-dot",
    "export-svg",
    "highlight-source",
    "export-web-component"
  ]
};
