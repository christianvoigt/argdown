import { argdown } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";
import { runArgdown } from "./runArgdown";

export const command = "web-component [inputGlob] [outputDir]";
export const desc = "export Argdown input as argdown-map web component";
export const builder = {
  logParserErrors: {
    describe: "Log parser errors to console",
    type: "boolean",
    default: true
  },
  removeFrontMatter: {
    alias: "remove-frontmatter",
    descrie: "Removes the frontmatter section from the highlighted source code",
    type: "boolean",
    default: false
  },
  addWebComponentScript: {
    alias: "wcscript",
    describe: "Add the webcomponent script",
    type: "boolean",
    default: true
  },
  addWebComponentPolyfill: {
    alias: "wcpolyfill",
    describe: "Add the webcomponent polyfill",
    type: "boolean",
    default: true
  },
  addGlobalStyles: {
    alias: "styles",
    describe: "Add the global styles for the component",
    type: "boolean",
    default: true
  }
};
export interface IWebComponentCliOptions {
  removeFrontMatter?: boolean;
  addWebComponentScript?: boolean;
  addWebComponentPolyfill?: boolean;
  addGlobalStyles?: boolean;
  inputGlob?: string;
  outputDir?: string;
}
export const handler = async function(
  args: Arguments<IGeneralCliOptions & IWebComponentCliOptions>
) {
  let config = await argdown.loadConfig(args.config);

  config.sourceHighlighter = config.sourceHighlighter || {};
  config.webComponent = config.webComponent || {};

  if (args.removeFrontMatter) {
    config.sourceHighlighter.removeFrontMatter = true;
  }
  if (args.addWebComponentScript) {
    config.webComponent.addWebComponentScript = args.addWebComponentScript;
  }
  if (args.addWebComponentPolyfill) {
    config.webComponent.addWebComponentPolyfill = args.addWebComponentPolyfill;
  }
  if (args.addGlobalStyles) {
    config.webComponent.addGlobalStyles = args.addGlobalStyles;
  }

  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (args.outputDir) {
    config.saveAs.outputDir = args.outputDir;
  }

  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.logLevel = args.silent ? "silent" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.process = ["load-file", "parse-input"];
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }
  config.process.push("build-model");
  config.process.push("build-map", "transform-closed-groups", "colorize");
  config.process.push(
    "export-dot",
    "export-svg",
    "highlight-source",
    "export-web-component"
  );

  if (!args.stdout || args.outputDir) {
    config.process.push("save-web-component-as-html");
  }

  if (args.stdout) {
    config.process.push("stdout-web-component");
  }
  await runArgdown(
    argdown,
    config,
    true,
    "Web component export canceled",
    "exported",
    "as web-components"
  );
};
