"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handler = exports.builder = exports.desc = exports.command = undefined;

var _index = require("../index.js");

const command = exports.command = "map [inputGlob] [outputDir]";
const desc = exports.desc = "export Argdown input as DOT files";
const builder = exports.builder = {
  logParserErrors: {
    alias: "e",
    describe: "Log parser errors to console",
    type: "boolean",
    default: true
  },
  useHtmlLabels: {
    alias: "html-labels",
    describe: "Use HTML node labels",
    type: "boolean"
  },
  argumentLabelMode: {
    alias: "argument-labels",
    choices: [undefined, "hide-untitled", "title", "description"],
    type: "string",
    describe: "The method by which argument label content is selected"
  },
  statementLabelMode: {
    alias: "statement-labels",
    choices: [undefined, "hide-untitled", "title", "text"],
    type: "string",
    describe: "The method by which statement label content is selected"
  },
  statementSelectionMode: {
    alias: "statement-selection",
    type: "string",
    choices: [undefined, "all", "titled", "roots", "statement-trees", "with-relations"]
  },
  graphName: {
    alias: "name",
    type: "string",
    describe: "Name of the graph"
  },
  lineLength: {
    alias: "line",
    type: "number",
    describe: "Number of chars in a label line."
  },
  groupColors: {
    type: "array",
    describe: "Colors for groups sorted by stacking order"
  },
  inclusive: {
    type: "boolean",
    describe: "Include disconnected nodes."
  },
  rankdir: {
    type: "string",
    describe: "Graphviz rankdir setting"
  },
  concentrate: {
    type: "string",
    describe: "Graphviz concentrate setting"
  },
  ratio: {
    type: "string",
    describe: "Graphviz ratio setting"
  },
  size: {
    type: "string",
    describe: "Graphviz size setting"
  },
  format: {
    alias: "f",
    type: "string",
    describe: "the file format (dot, svg, pdf)",
    default: "pdf"
  }
};
const handler = exports.handler = function (argv) {
  let config = _index.app.loadConfig(argv.config);

  config.dot = config.dot || config.DotExport || {};
  config.map = config.map || config.MapMaker || {};
  const format = argv.format || "pdf";
  if (format === "pdf") {
    config.svgToPdf = config.svgToPdf || config.SvgToPdfExportPlugin || {};
  } else {
    config.saveAs = config.saveAs || config.SaveAsFilePlugin || {};
  }

  if (argv.useHtmlLabels) {
    config.dot.useHtmlLabels = true;
  }

  if (argv.argumentLabelMode) {
    config.dot.argumentLabelMode = argv.argumentLabelMode;
  }
  if (argv.statementLabelMode) {
    config.dot.statementLabelMode = argv.statementLabelMode;
  }
  if (argv.statementSelectionMode) {
    config.map.statementSelectionMode = argv.statementSelectionMode;
  }
  if (argv.inclusive) {
    config.map.excludeDisconnected = false;
  }

  if (argv.graphName) {
    config.dot.graphname = argv.graphName;
  }
  if (argv.lineLength) {
    config.dot.lineLength = argv.lineLength;
  }
  if (argv.groupColors) {
    config.dot.groupColors = argv.groupColors;
  }

  config.dot.graphVizSettings = config.dot.graphVizSettings || {};
  if (argv.concentration) {
    config.dot.graphVizSettings.concentration = argv.contentration;
  }
  if (argv.size) {
    config.dot.graphVizSettings.size = argv.size;
  }
  if (argv.ratio) {
    config.dot.graphVizSettings.ratio = argv.ratio;
  }
  if (argv.rankdir) {
    config.dot.graphVizSettings.rankdir = argv.rankdir;
  }

  if (argv.inputGlob) {
    config.inputPath = argv.inputGlob;
  }
  if (argv.outputDir) {
    if (format === "pdf") {
      config.svgToPdf.outputDir = argv.outputDir;
    } else {
      config.saveAs.outputDir = argv.outputDir;
    }
  }
  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.process = ["preprocessor", "parse-input"];
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push("build-model");
  config.process.push("export-dot");
  if (format !== "dot") {
    config.process.push("export-svg");
  }
  if (!argv.stdout || argv.outputDir) {
    if (format === "dot") {
      config.process.push("save-as-dot");
    } else if (format === "svg") {
      config.process.push("save-svg-as-svg");
    } else {
      config.process.push("save-svg-as-pdf");
    }
  }

  if (argv.stdout) {
    if (format === "dot") {
      config.process.push("stdout-dot");
    } else {
      // pdf and png to stdout is currently not supported
      config.process.push("stdout-svg");
    }
  }
  _index.app.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=MapCommand.js.map