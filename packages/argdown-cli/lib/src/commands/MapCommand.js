"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@argdown/node");
const core_1 = require("@argdown/core");
exports.command = "map [inputGlob] [outputDir]";
exports.desc = "export Argdown input as DOT files";
exports.builder = {
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
        choices: [undefined, core_1.LabelMode.HIDE_UNTITLED, core_1.LabelMode.TITLE, core_1.LabelMode.TEXT],
        type: "string",
        describe: "The method by which argument label content is selected"
    },
    statementLabelMode: {
        alias: "statement-labels",
        choices: [undefined, core_1.LabelMode.HIDE_UNTITLED, core_1.LabelMode.TITLE, core_1.LabelMode.TEXT],
        type: "string",
        describe: "The method by which statement label content is selected"
    },
    statementSelectionMode: {
        alias: "statement-selection",
        describe: "The method that determines which statements are inserted as nodes into the map",
        type: "string",
        choices: [
            undefined,
            core_1.StatementSelectionMode.ALL,
            core_1.StatementSelectionMode.WITH_TITLE,
            core_1.StatementSelectionMode.TOP_LEVEL,
            core_1.StatementSelectionMode.NOT_USED_IN_ARGUMENT,
            core_1.StatementSelectionMode.WITH_RELATIONS,
            core_1.StatementSelectionMode.WITH_MORE_THAN_ONE_RELATION
        ]
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
exports.handler = async (argv) => {
    let config = (await node_1.argdown.loadConfig(argv.config));
    config.dot = config.dot || {};
    config.map = config.map || {};
    const format = argv.format || "pdf";
    if (format === "pdf") {
        config.svgToPdf = config.svgToPdf || {};
    }
    else {
        config.saveAs = config.saveAs || {};
    }
    if (argv.useHtmlLabels) {
        config.dot.useHtmlLabels = true;
    }
    if (argv.argumentLabelMode) {
        config.map.argumentLabelMode = argv.argumentLabelMode;
    }
    if (argv.statementLabelMode) {
        config.map.statementLabelMode = argv.statementLabelMode;
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
        }
        else {
            config.saveAs.outputDir = argv.outputDir;
        }
    }
    config.logLevel = argv.verbose ? "verbose" : config.logLevel;
    config.watch = argv.watch || config.watch;
    config.process = ["load-file", "parse-input"];
    config.logParserErrors = argv.logParserErrors || config.logParserErrors;
    if (config.logParserErrors) {
        config.process.push("log-parser-errors");
    }
    config.process.push("build-model");
    config.process.push("build-map");
    config.process.push("export-dot");
    if (format !== "dot") {
        config.process.push("export-svg");
    }
    if (!argv.stdout || argv.outputDir) {
        if (format === "dot") {
            config.process.push("save-as-dot");
        }
        else if (format === "svg") {
            config.process.push("save-svg-as-svg");
        }
        else {
            config.process.push("save-svg-as-pdf");
        }
    }
    if (argv.stdout) {
        if (format === "dot") {
            config.process.push("stdout-dot");
        }
        else {
            config.process.push("stdout-svg");
        }
    }
    await node_1.argdown.load(config).catch(e => console.log(e));
};
//# sourceMappingURL=MapCommand.js.map