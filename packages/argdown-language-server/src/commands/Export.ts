import Uri from "vscode-uri";
import { TextDocument } from "vscode-languageserver";
import { AsyncArgdownApplication } from "@argdown/node";
import { IArgdownRequest } from "@argdown/core";
interface IDictionary<T> {
  [Key: string]: T;
}

export interface ExportContentArgs {
  content: string;
  target: string;
  process: string;
}
export interface ExportDocumentArgs {
  source: string;
  target: string;
  process: string;
}
const requestProviders: IDictionary<(r: any) => any> = {
  "vizjs-to-svg": r => {
    return {
      ...r,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "export-dot",
        "export-svg",
        "save-svg-as-svg"
      ]
    };
  },
  "vizjs-to-pdf": r => {
    return {
      ...r,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "export-dot",
        "export-svg",
        "save-svg-as-pdf"
      ]
    };
  },
  "dagre-to-pdf": r => {
    return {
      ...r,
      process: ["save-svg-as-pdf"]
    };
  },
  dot: r => {
    return {
      ...r,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "transform-closed-groups",
        "colorize",
        "export-dot",
        "save-as-dot"
      ]
    };
  },
  graphml: r => {
    return {
      ...r,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "colorize",
        "export-graphml",
        "save-as-graphml"
      ]
    };
  },
  html: r => {
    return {
      ...r,
      process: [
        "parse-input",
        "build-model",
        "colorize",
        "export-html",
        "save-as-html",
        "copy-default-css"
      ]
    };
  },
  json: r => {
    return {
      ...r,
      process: [
        "parse-input",
        "build-model",
        "build-map",
        "colorize",
        "export-json",
        "save-as-json"
      ]
    };
  }
};
export const exportContent = async (
  argdownEngine: AsyncArgdownApplication,
  args: ExportContentArgs
) => {
  let request: IArgdownRequest = {};
  if (args.process === "vizjs-to-pdf" || args.process === "dagre-to-pdf") {
    request.outputPath = Uri.parse(args.target).fsPath;
    const getRequest = requestProviders[args.process];
    request = getRequest(request);
    const response = {
      svg: args.content
    };
    await argdownEngine.runAsync(request, response);
  } else {
    request.input = args.content;
    request.outputPath = Uri.parse(args.target).fsPath;
    const getRequest = requestProviders[args.process];
    request = getRequest(request);
    await argdownEngine.runAsync(request);
  }
};
export const exportDocument = async (
  argdownEngine: AsyncArgdownApplication,
  args: ExportDocumentArgs,
  doc: TextDocument | undefined
) => {
  let request: any = { logLevel: "none" };
  request.inputPath = Uri.parse(args.source).fsPath;
  request.outputPath = Uri.parse(args.target).fsPath;
  const getRequest = requestProviders[args.process];
  request = getRequest(request);
  if (doc) {
    request.input = doc.getText();
    await argdownEngine.runAsync(request);
  } else {
    await argdownEngine.load(request);
  }
};
