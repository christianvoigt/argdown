import { URI } from "vscode-uri";
import { TextDocument } from "vscode-languageserver-textdocument";
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
  "web-component-to-html": r => {
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
        "highlight-source",
        "export-web-component",
        "save-web-component-as-html"
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
    request.outputPath = URI.parse(args.target).fsPath;
    const getRequest = requestProviders[args.process];
    request = getRequest(request);
    const response = {
      svg: args.content
    };
    await argdownEngine.runAsync(request, response);
  } else {
    request.input = args.content;
    request.outputPath = URI.parse(args.target).fsPath;
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
  request.inputPath = URI.parse(args.source).fsPath;
  request.outputPath = URI.parse(args.target).fsPath;
  const getRequest = requestProviders[args.process];
  request = getRequest(request);
  if (doc) {
    request.input = doc.getText();
    await argdownEngine.runAsync(request);
  } else {
    await argdownEngine.load(request);
  }
};
export const returnDocument = async (
  argdownEngine: AsyncArgdownApplication,
  args: ExportDocumentArgs,
  doc: TextDocument | undefined
) => {
  if (doc) {
    let request: any = { logLevel: "none" };
    request.inputPath = URI.parse(args.source).fsPath;
    request.outputPath = URI.parse(args.target).fsPath;
    const getRequest = requestProviders[args.process];
    let returnField = null;
    if (args.process === "web-component-to-html") {
      returnField = "webComponent";
    }
    request = getRequest(request);
    request.input = doc.getText();
    const response = await argdownEngine.runAsync(request);
    if (returnField && hasKey(response, returnField)) {
      return response[returnField];
    }
  }
  return null;
};
function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj;
}
