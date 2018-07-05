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
  PreselectionPlugin,
  StatementSelectionPlugin,
  ArgumentSelectionPlugin,
  GroupPlugin,
  RegroupPlugin
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
const regroupPlugin = new RegroupPlugin();
argdown.addPlugin(regroupPlugin, "build-model");
const colorPlugin = new ColorPlugin();
argdown.addPlugin(colorPlugin, "build-model");

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

const dotToSvgExport = new DotToSvgExportPlugin();
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

argdown.defaultProcesses = {
  "export-svg": ["load-file", "parse-input", "build-model", "build-map", "export-dot", "export-svg", "save-svg-as-svg"],
  "export-pdf": ["load-file", "parse-input", "build-model", "build-map", "export-dot", "export-svg", "save-svg-as-pdf"],
  "export-dot": ["load-file", "parse-input", "build-model", "build-map", "export-dot", "save-as-dot"],
  "export-json": ["load-file", "parse-input", "build-model", "build-map", "export-json", "save-as-json"],
  "export-html": ["load-file", "parse-input", "build-model", "export-html", "save-as-html"]
};
