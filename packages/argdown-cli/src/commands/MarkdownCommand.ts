import { argdown, IAsyncArgdownPlugin } from "@argdown/node";
import { Arguments } from "yargs";
import { IGeneralCliOptions } from "../IGeneralCliOptions";
import MarkdownIt from "markdown-it";
import createArgdownPlugin from "@argdown/markdown-it-plugin";
/**
 * This command uses the AsynArgdownApplication to load and export markdown files and save the exported html as html files.
 * It add a custom plugin that simply takes the markdown input and renders it with markdown-it
 * Markdown-it is configured to use the @argdown/markdown-it-plugin.
 */
const mdi = new MarkdownIt();
const markdownItPlugin = createArgdownPlugin((env: any) => {
  return env.argdownConfig;
});
mdi.use(markdownItPlugin);
const markdownPlugin: IAsyncArgdownPlugin = {
  name: "RenderMarkdownPlugin",
  runAsync: async (request, response) => {
    response.html = mdi.render(request.input || "", {
      argdownConfig: request
    });
  }
};
argdown.addPlugin(markdownPlugin, "render-markdown");

export const command = "markdown [inputGlob] [outputDir]";
export const desc =
  "export Markdown file to html while exporting all Argdown code fences as web components";
export const builder = {};
export interface IMarkdownCliOptions {
  inputGlob?: string;
  outputDir?: string;
}
export const handler = async function(
  args: Arguments<IGeneralCliOptions & IMarkdownCliOptions>
) {
  let config = await argdown.loadConfig(args.config);

  if (args.inputGlob) {
    config.inputPath = args.inputGlob;
  }
  config.saveAs = config.saveAs || {};
  if (args.outputDir) {
    config.saveAs.outputDir = args.outputDir;
  }

  config.logLevel = args.verbose ? "verbose" : config.logLevel;
  config.watch = args.watch || config.watch;
  config.process = ["load-file", "render-markdown"];
  config.logParserErrors = args.logParserErrors || config.logParserErrors;
  if (config.logParserErrors) {
    config.process.push("log-parser-errors");
  }

  if (!args.stdout || args.outputDir) {
    config.process.push("save-as-html");
  }

  if (args.stdout) {
    config.process.push("stdout-html");
  }
  await argdown.load(config).catch((e: Error) => console.log(e.message));
};
