"use strict";

import { AsyncArgdownApplication } from "./AsyncArgdownApplication";
import {
  ParserPlugin,
  ModelPlugin,
  HtmlExportPlugin,
  JSONExportPlugin,
  ColorPlugin,
  MapPlugin,
  DotExportPlugin,
  DataPlugin,
  GraphMLExportPlugin,
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  GroupPlugin,
  RegroupPlugin,
  ClosedGroupPlugin,
  WebComponentExportPlugin,
  HighlightSourcePlugin,
  ExplodeArgumentsPlugin,
  MapNodeImagesPlugin
} from "@argdown/core";
import { SyncDotToSvgExportPlugin } from "@argdown/core/dist/plugins/SyncDotToSvgExportPlugin";
import { SaveAsFilePlugin } from "./plugins/SaveAsFilePlugin";
import { SvgToPdfExportPlugin } from "./plugins/SvgToPdfExportPlugin";
import { CopyDefaultCssPlugin } from "./plugins/CopyDefaultCssPlugin";
import { LogParserErrorsPlugin } from "./plugins/LogParserErrorsPlugin";
import { StdOutPlugin } from "./plugins/StdOutPlugin";
import { IncludePlugin } from "./plugins/IncludePlugin";
import { LoadFilePlugin } from "./plugins/LoadFilePlugin";
import { ImageSizePlugin } from "./plugins/ImageSizePlugin";
import { GenerateDataUrlsPlugin } from "./plugins/GenerateDataUrlsPlugin";

export const argdown = new AsyncArgdownApplication();

const loadFilePlugin = new LoadFilePlugin();
argdown.addPlugin(loadFilePlugin, "load-file");
const includePlugin = new IncludePlugin();
argdown.addPlugin(includePlugin, "load-file");

const parserPlugin = new ParserPlugin();
argdown.addPlugin(parserPlugin, "parse-input");
const logParserErrorsPlugin = new LogParserErrorsPlugin();
argdown.addPlugin(logParserErrorsPlugin, "log-parser-errors");
const dataPlugin = new DataPlugin();
argdown.addPlugin(dataPlugin, "build-model");
const modelPlugin = new ModelPlugin();
argdown.addPlugin(modelPlugin, "build-model");
argdown.addPlugin(new ExplodeArgumentsPlugin(), "build-model");
const regroupPlugin = new RegroupPlugin();
argdown.addPlugin(regroupPlugin, "build-model");

const preselectionPlugin = new PreselectionPlugin();
argdown.addPlugin(preselectionPlugin, "build-map");
const statementSelectionPlugin = new StatementSelectionPlugin();
argdown.addPlugin(statementSelectionPlugin, "build-map");
const argumentSelectionPlugin = new ArgumentSelectionPlugin();
argdown.addPlugin(argumentSelectionPlugin, "build-map");
const mapPlugin = new MapPlugin();
argdown.addPlugin(mapPlugin, "build-map");
const groupPlugin = new GroupPlugin();
argdown.addPlugin(groupPlugin, "build-map");
argdown.addPlugin(new ClosedGroupPlugin(), "transform-closed-groups");
const colorPlugin = new ColorPlugin();
argdown.addPlugin(colorPlugin, "colorize");
argdown.addPlugin(new MapNodeImagesPlugin(), "add-images");
argdown.addPlugin(new ImageSizePlugin(), "add-images");
argdown.addPlugin(new GenerateDataUrlsPlugin(), "add-images");

const stdoutArgdown = new StdOutPlugin({
  dataKey: "input",
  isRequestData: true
});
argdown.addPlugin(stdoutArgdown, "stdout-argdown");
const saveAsArgdown = new SaveAsFilePlugin({
  outputDir: "./compiled",
  dataKey: "input",
  extension: ".argdown",
  isRequestData: true
});
argdown.addPlugin(saveAsArgdown, "save-as-argdown");

const htmlExport = new HtmlExportPlugin();
argdown.addPlugin(htmlExport, "export-html");
const copyDefaultCss = new CopyDefaultCssPlugin();
argdown.addPlugin(copyDefaultCss, "copy-default-css");
const saveAsHtml = new SaveAsFilePlugin({
  outputDir: "./html",
  dataKey: "html",
  extension: ".html"
});
argdown.addPlugin(saveAsHtml, "save-as-html");
const stdoutHtml = new StdOutPlugin({ dataKey: "html" });
argdown.addPlugin(stdoutHtml, "stdout-html");

const jsonExport = new JSONExportPlugin();
argdown.addPlugin(jsonExport, "export-json");
const saveAsJSON = new SaveAsFilePlugin({
  outputDir: "./json",
  dataKey: "json",
  extension: ".json"
});
argdown.addPlugin(saveAsJSON, "save-as-json");
const stdoutJSON = new StdOutPlugin({ dataKey: "json" });
argdown.addPlugin(stdoutJSON, "stdout-json");

const dotExport = new DotExportPlugin();
argdown.addPlugin(dotExport, "export-dot");
const saveAsDot = new SaveAsFilePlugin({
  outputDir: "./dot",
  dataKey: "dot",
  extension: ".dot"
});
argdown.addPlugin(saveAsDot, "save-as-dot");
const stdoutDot = new StdOutPlugin({ dataKey: "dot" });
argdown.addPlugin(stdoutDot, "stdout-dot");

const graphMLExport = new GraphMLExportPlugin();
argdown.addPlugin(graphMLExport, "export-graphml");
const saveAsGraphML = new SaveAsFilePlugin({
  outputDir: "./graphml",
  dataKey: "graphml",
  extension: ".graphml"
});
argdown.addPlugin(saveAsGraphML, "save-as-graphml");
const stdoutGraphML = new StdOutPlugin({ dataKey: "graphml" });
argdown.addPlugin(stdoutGraphML, "stdout-graphml");

const dotToSvgExport = new SyncDotToSvgExportPlugin();
argdown.addPlugin(dotToSvgExport, "export-svg");
const saveSvgAsSvg = new SaveAsFilePlugin({
  outputDir: "./svg",
  dataKey: "svg",
  extension: ".svg"
});
argdown.addPlugin(saveSvgAsSvg, "save-svg-as-svg");
const stdoutSvg = new StdOutPlugin({ dataKey: "svg" });
argdown.addPlugin(stdoutSvg, "stdout-svg");
const saveSvgAsPdf = new SvgToPdfExportPlugin();
argdown.addPlugin(saveSvgAsPdf, "save-svg-as-pdf");

argdown.addPlugin(new HighlightSourcePlugin(), "highlight-source");
argdown.addPlugin(new WebComponentExportPlugin(), "export-web-component");
const stdoutWebComponent = new StdOutPlugin({ dataKey: "webComponent" });
argdown.addPlugin(stdoutWebComponent, "stdout-web-component");
const saveWebComponentAsHtml = new SaveAsFilePlugin({
  outputDir: "./html",
  dataKey: "webComponent",
  extension: ".component.html"
});
argdown.addPlugin(saveWebComponentAsHtml, "save-web-component-as-html");

argdown.defaultProcesses = {
  parse: ["load-file", "parse-input"],
  "export-svg": [
    "load-file",
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "add-images",
    "export-dot",
    "export-svg",
    "save-svg-as-svg"
  ],
  "export-pdf": [
    "load-file",
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "add-images",
    "export-dot",
    "export-svg",
    "save-svg-as-pdf"
  ],
  "export-dot": [
    "load-file",
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "add-images",
    "export-dot",
    "save-as-dot"
  ],
  "export-graphml": [
    "load-file",
    "parse-input",
    "build-model",
    "build-map",
    "colorize",
    "add-images",
    "export-graphml",
    "save-as-graphml"
  ],
  "export-json": [
    "load-file",
    "parse-input",
    "build-model",
    "build-map",
    "colorize",
    "add-images",
    "export-json",
    "save-as-json"
  ],
  "export-html": [
    "load-file",
    "parse-input",
    "build-model",
    "colorize",
    "add-images",
    "export-html",
    "save-as-html"
  ],
  "export-web-component": [
    "load-file",
    "parse-input",
    "build-model",
    "build-map",
    "transform-closed-groups",
    "colorize",
    "add-images",
    "export-dot",
    "export-svg",
    "highlight-source",
    "export-web-component",
    "save-web-component-as-html"
  ]
};
