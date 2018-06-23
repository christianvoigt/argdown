"use strict";

import { AsyncArgdownApplication } from "./AsyncArgdownApplication";
import {
  ParserPlugin,
  ModelPlugin,
  HtmlExportPlugin,
  JSONExportPlugin,
  TagPlugin,
  MapPlugin,
  DotExportPlugin,
  DataPlugin
} from "@argdown/core";
import { SaveAsFilePlugin } from "./plugins/SaveAsFilePlugin";
import { DotToSvgExportPlugin } from "./plugins/DotToSvgExportPlugin";
import { SvgToPdfExportPlugin } from "./plugins/SvgToPdfExportPlugin";
import { CopyDefaultCssPlugin } from "./plugins/CopyDefaultCssPlugin";
import { LogParserErrorsPlugin } from "./plugins/LogParserErrorsPlugin";
import { StdOutPlugin } from "./plugins/StdOutPlugin";
import { IncludePlugin } from "./plugins/IncludePlugin";
import { LoadFilePlugin } from "./plugins/LoadFilePlugin";

export const argdown = new AsyncArgdownApplication();
const loadFilePlugin = new LoadFilePlugin();
const includePlugin = new IncludePlugin();
const parserPlugin = new ParserPlugin();
const logParserErrorsPlugin = new LogParserErrorsPlugin();
const dataPlugin = new DataPlugin();
const modelPlugin = new ModelPlugin();
const htmlExport = new HtmlExportPlugin();
const tagPlugin = new TagPlugin();
const mapPlugin = new MapPlugin();
const dotExport = new DotExportPlugin();
const jsonExport = new JSONExportPlugin();
const saveAsHtml = new SaveAsFilePlugin({
  outputDir: "./html",
  dataKey: "html",
  extension: ".html"
});
const copyDefaultCss = new CopyDefaultCssPlugin();
const dotToSvgExport = new DotToSvgExportPlugin();
const saveSvgAsSvg = new SaveAsFilePlugin({
  outputDir: "./svg",
  dataKey: "svg",
  extension: ".svg"
});
const saveSvgAsPdf = new SvgToPdfExportPlugin();

const saveAsDot = new SaveAsFilePlugin({
  outputDir: "./dot",
  dataKey: "dot",
  extension: ".dot"
});
const saveAsJSON = new SaveAsFilePlugin({
  outputDir: "./json",
  dataKey: "json",
  extension: ".json"
});
const saveAsArgdown = new SaveAsFilePlugin({
  outputDir: "./compiled",
  dataKey: "input",
  extension: ".argdown",
  isRequestData: true
});
const stdoutDot = new StdOutPlugin({ dataKey: "dot" });
const stdoutSvg = new StdOutPlugin({ dataKey: "svg" });
const stdoutJSON = new StdOutPlugin({ dataKey: "json" });
const stdoutHtml = new StdOutPlugin({ dataKey: "html" });
const stdoutArgdown = new StdOutPlugin({
  dataKey: "input",
  isRequestData: true
});

argdown.addPlugin(loadFilePlugin, "load-file");
argdown.addPlugin(includePlugin, "load-file");
argdown.addPlugin(parserPlugin, "parse-input");
argdown.addPlugin(logParserErrorsPlugin, "log-parser-errors");
argdown.addPlugin(dataPlugin, "build-model");
argdown.addPlugin(modelPlugin, "build-model");
argdown.addPlugin(tagPlugin, "build-model");

argdown.addPlugin(mapPlugin, "build-map");

argdown.addPlugin(stdoutArgdown, "stdout-argdown");
argdown.addPlugin(saveAsArgdown, "save-as-argdown");

argdown.addPlugin(htmlExport, "export-html");
argdown.addPlugin(copyDefaultCss, "copy-default-css");
argdown.addPlugin(saveAsHtml, "save-as-html");
argdown.addPlugin(stdoutHtml, "stdout-html");

argdown.addPlugin(jsonExport, "export-json");
argdown.addPlugin(saveAsJSON, "save-as-json");
argdown.addPlugin(stdoutJSON, "stdout-json");

argdown.addPlugin(dotExport, "export-dot");
argdown.addPlugin(saveAsDot, "save-as-dot");
argdown.addPlugin(stdoutDot, "stdout-dot");
argdown.addPlugin(dotToSvgExport, "export-svg");
argdown.addPlugin(saveSvgAsSvg, "save-svg-as-svg");
argdown.addPlugin(stdoutSvg, "stdout-svg");
argdown.addPlugin(saveSvgAsPdf, "save-svg-as-pdf");
