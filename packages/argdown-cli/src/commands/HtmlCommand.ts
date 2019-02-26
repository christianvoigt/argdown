import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";

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
    describe:
      "Allows you to prepend a custom head element to the html (has to include doctype and html opening tag)",
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
export interface IHtmlCliOptions {
  charset?: string;
  headless?: boolean;
  title?: string;
  css?: string;
  lang?: string;
  inputGlob?: string;
  outputDir?: string;
}
export const handler = async function(
  args: Arguments<IGeneralCliOptions & IHtmlCliOptions>
) {
  let config = await argdown.loadConfig(args.config);

  config.html = config.html || {};

  if (args.headless) {
    config.html.headless = true;
  }
  if (args.title) {
    config.html.title = args.title;
  }
  if (args.lang) {
    config.html.lang = args.lang;
  }

  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (args.outputDir) {
    config.saveAs.outputDir = args.outputDir;
  }

  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.process = ["load-file", "parse-input"];
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push("build-model");
  config.process.push("colorize");
  config.process.push("export-html");

  if (!args.stdout || args.outputDir) {
    config.process.push("save-as-html");
  }

  if (args.css) {
    config.html.css = args.css;
  } else if (!args.stdout || args.outputDir) {
    config.process.push("copy-default-css");
  }
  if (args.stdout) {
    config.process.push("stdout-html");
  }

  await argdown.load(config).catch((e: Error) => console.log(e.message));
};
