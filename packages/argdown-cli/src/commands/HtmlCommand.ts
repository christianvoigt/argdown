import { argdown } from "@argdown/node";
import { Arguments } from "yargs";

export const command = "html [inputGlob] [outputDir]";
export const desc = "export Argdown input as HTML files";
export const builder = {
  logParserErrors: {
    alias: "e",
    describe: "Log parser errors to console",
    type: "boolean",
    default: true
  },
  headless: {
    alias: "hl",
    describe: "Export without Html, Head and Body elements",
    type: "boolean"
  },
  head: {
    alias: "h",
    describe: "Allows you to prepend a custom head element to the html (has to include doctype and html opening tag)",
    type: "string"
  },
  css: {
    alias: "c",
    describe: "path to custom CSS file to include in the default HTML head",
    type: "string"
  },
  title: {
    alias: "t",
    describe: "Title for HTML document (default: H1 element content)",
    type: "string"
  },
  lang: {
    alias: "l",
    describe: "Language of HTML document",
    type: "string"
  },
  charset: {
    alias: "cs",
    describe: "Charset of HTML document",
    type: "string"
  }
};
export const handler = async function(argv: Arguments) {
  let config = await argdown.loadConfig(argv.config);

  config.html = config.html || {};

  if (argv.headless) {
    config.html.headless = true;
  }
  if (argv.title) {
    config.html.title = argv.title;
  }

  if (argv.inputGlob) {
    config.inputPath = argv.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (argv.outputDir) {
    config.saveAs.outputDir = argv.outputDir;
  }

  config.logLevel = argv.verbose ? "verbose" : config.logLevel;
  config.watch = argv.watch || config.watch;
  config.process = ["load-file", "parse-input"];
  config.logParserErrors = argv.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push("build-model");
  config.process.push("export-html");

  if (!argv.stdout || argv.outputDir) {
    config.process.push("save-as-html");
  }

  if (argv.css) {
    config.html.css = argv.css;
  } else if (!argv.stdout || argv.outputDir) {
    config.process.push("copy-default-css");
  }
  if (argv.stdout) {
    config.process.push("stdout-html");
  }

  await argdown.load(config).catch((e: Error) => console.log(e.message));
};
