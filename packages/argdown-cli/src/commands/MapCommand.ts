import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { StatementSelectionMode, LabelMode } from "@argdown/core";
import { IGeneralCliOptions } from "../IGeneralCliOptions";
import { tryToInstallImageExport } from "../tryToInstallImageExport";

export const command = "map [inputGlob] [outputDir]";
export const desc = "export Argdown input as DOT files";
export const builder = {
  useHtmlLabels: {
    alias: "html-labels",
    describe: "Use HTML node labels",
    type: "boolean"
  },
  argumentLabelMode: {
    alias: "argument-labels",
    choices: [
      undefined,
      LabelMode.HIDE_UNTITLED,
      LabelMode.TITLE,
      LabelMode.TEXT
    ],
    type: "string",
    describe: "The method by which argument label content is selected"
  },
  statementLabelMode: {
    alias: "statement-labels",
    choices: [
      undefined,
      LabelMode.HIDE_UNTITLED,
      LabelMode.TITLE,
      LabelMode.TEXT
    ],
    type: "string",
    describe: "The method by which statement label content is selected"
  },
  statementSelectionMode: {
    alias: "statement-selection",
    describe:
      "The method that determines which statements are inserted as nodes into the map",
    type: "string",
    choices: [
      undefined,
      StatementSelectionMode.ALL,
      StatementSelectionMode.WITH_TITLE,
      StatementSelectionMode.TOP_LEVEL,
      StatementSelectionMode.NOT_USED_IN_ARGUMENT,
      StatementSelectionMode.WITH_RELATIONS,
      StatementSelectionMode.WITH_MORE_THAN_ONE_RELATION
    ]
  },
  graphName: {
    alias: "name",
    type: "string",
    describe: "Name of the graph"
  },
  inclusive: {
    type: "boolean",
    describe: "Include disconnected nodes."
  },
  rankdir: {
    type: "string",
    describe: "Graphviz rankdir setting"
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
    describe:
      "the file format (dot, graphml, svg, pdf, png, jpg, webp). For png, jpg or webp export you have first to install the Argdown image export plugin by running 'npm install -g @argdown/image-export'.",
    default: "pdf"
  }
};
export interface IMapCliOptions {
  format?: string;
  size?: string;
  ratio?: string;
  rankdir?: string;
  inclusive?: boolean;
  graphName?: string;
  statementSelectionMode?: StatementSelectionMode;
  statementLabelMode?: LabelMode;
  argumentLabelMode?: LabelMode;
  useHtmlLabels?: boolean;
  inputGlob?: string;
  outputDir?: string;
}
export const handler = async (
  args: Arguments<IGeneralCliOptions & IMapCliOptions>
) => {
  let config = await argdown.loadConfig(args.config);

  config.dot = config.dot || {};
  config.map = config.map || {};
  config.group = config.group || {};
  config.selection = config.selection || {};
  config.color = config.color || {};
  const format = args.format || "pdf";

  if (format === "pdf") {
    config.svgToPdf = config.svgToPdf || {};
  } else {
    if (format === "png" || format === "jpg" || format === "webp") {
      const installed = await tryToInstallImageExport(argdown);
      if (!installed) {
        throw new Error(
          `You are trying to export to ${format} but have not installed the Argdown image export plugin. Please run 'npm install -g @argdown/image-export' first. This will automatically add the plugin to @argdown/cli.`
        );
      }
    }
    config.saveAs = config.saveAs || {};
  }

  if (args.useHtmlLabels) {
    config.dot.useHtmlLabels = true;
  }

  if (args.argumentLabelMode) {
    config.map.argumentLabelMode = args.argumentLabelMode;
  }
  if (args.statementLabelMode) {
    config.map.statementLabelMode = args.statementLabelMode;
  }
  if (args.statementSelectionMode) {
    config.selection.statementSelectionMode = args.statementSelectionMode;
  }
  if (args.inclusive) {
    config.selection.excludeDisconnected = false;
  }

  if (args.graphName) {
    config.dot.graphname = args.graphName;
  }

  config.dot.graphVizSettings = config.dot.graphVizSettings || {};
  if (args.size) {
    config.dot.graphVizSettings.size = args.size;
  }
  if (args.ratio) {
    config.dot.graphVizSettings.ratio = args.ratio;
  }
  if (args.rankdir) {
    config.dot.graphVizSettings.rankdir = args.rankdir;
  }

  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  if (args.outputDir) {
    if (format === "pdf") {
      config.svgToPdf!.outputDir = args.outputDir;
    } else {
      config.saveAs!.outputDir = args.outputDir;
    }
  }
  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.process = ["load-file", "parse-input"];
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push("build-model");
  config.process.push("build-map");
  config.process.push("colorize");
  if (format != "graphml") {
    config.process.push("export-dot");
    if (format !== "dot") {
      config.process.push("export-svg");
    }
  } else {
    config.process.push("export-graphml");
  }
  if (!args.stdout || args.outputDir) {
    if (format === "dot") {
      config.process.push("save-as-dot");
    } else if (format === "svg") {
      config.process.push("save-svg-as-svg");
    } else if (format === "graphml") {
      config.process.push("save-as-graphml");
    } else if (format === "pdf") {
      config.process.push("save-svg-as-pdf");
    } else if (format === "png") {
      config.process.push("export-png");
      config.process.push("save-as-png");
    } else if (format === "jpg") {
      config.process.push("export-jpg");
      config.process.push("save-as-jpg");
    } else if (format === "webp") {
      config.process.push("export-webp");
      config.process.push("save-as-webp");
    }
  }

  if (args.stdout) {
    if (format === "dot") {
      config.process.push("stdout-dot");
    } else if (format === "graphml") {
      config.process.push("stdout-graphml");
    } else if (format === "svg") {
      // pdf to stdout is currently not supported
      config.process.push("stdout-svg");
    } else if (format === "png") {
      config.process.push("export-png");
      config.process.push("stdout-png");
    } else if (format === "jpg") {
      config.process.push("export-jpg");
      config.process.push("stdout-jpg");
    } else if (format === "webp") {
      config.process.push("export-webp");
      config.process.push("stdout-webp");
    }
  }
  await argdown.load(config).catch(e => console.log(e));
};
