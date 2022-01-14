import * as vscode from "vscode";
import { Command } from "./Command";
import { isArgdownFile } from "../preview/util/file";
import { Utils } from "vscode-uri";

export interface IExportContentArgs {
  source: string;
  content: string;
  target: string;
  process: string;
}

const getTargetFileUri = async (
  resource: vscode.Uri,
  filters: { [name: string]: string[] },
  defaultExtension: string
): Promise<vscode.Uri | undefined> => {
  let uri = resource;
  if (!uri && vscode.window.activeTextEditor) {
    // If the command is not invoked with a resource argument (e.g. in the command palette), we try to use the uri of the active document
    if (!vscode.window.activeTextEditor) {
      return;
    }
    const doc = vscode.window.activeTextEditor.document;
    if (!isArgdownFile(doc)) {
      return;
    }
    uri = doc.uri;
  }
  if (vscode.env.appHost !== "desktop") {
    vscode.window.showInformationMessage(
      "This command is only supported in the desktop version of VSCode. Please install VSCode on your computer to use this feature."
    );
    return;
  }
  if (!uri) {
    return;
  }
  const fileDir = Utils.dirname(uri);
  // const extension: string = Utils.extname(uri);
  const fileName: string = Utils.basename(uri);
  const defaultUri = vscode.Uri.joinPath(
    fileDir,
    fileName + "." + defaultExtension
  );
  const option: vscode.SaveDialogOptions = {
    defaultUri,
    filters: filters
  };
  return await vscode.window.showSaveDialog(option);
};
const saveExportedFile = async (
  resource: vscode.Uri,
  content: string,
  filters: { [name: string]: string[] },
  defaultExtension: string
) => {
  var fileUri = await getTargetFileUri(resource, filters, defaultExtension);
  if (fileUri) {
    try {
      const buf = Buffer.from(content, "utf8");
      vscode.workspace.fs.writeFile(fileUri, buf);
    } catch (e) {
      return console.log(e);
    }
  }
};
const savePng = async (resource: vscode.Uri, content: string) => {
  var fileUri = await getTargetFileUri(resource, { PNG: ["png"] }, "png");
  if (fileUri) {
    const data = content.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, "base64");
    try {
      await vscode.workspace.fs.writeFile(fileUri, buf);
    } catch (e) {
      return console.log(e);
    }
  }
};
const sendToLanguageServer = async (
  resource: vscode.Uri,
  content: string,
  filters: { [name: string]: string[] },
  defaultExtension: string,
  process: string
) => {
  const fileUri = await getTargetFileUri(resource, filters, defaultExtension);
  if (fileUri) {
    const args: IExportContentArgs = {
      source: resource.toString(),
      content,
      target: fileUri.toString(),
      process: process
    };
    vscode.commands.executeCommand("argdown.server.exportContent", args);
  }
};
export class ExportContentToVizjsPngCommand implements Command {
  private static readonly id = "argdown.exportContentToVizjsPng";
  public readonly id = ExportContentToVizjsPngCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportContentToVizjsPngCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri, content: string) {
    savePng(resource, content);
  }
}
export class ExportContentToDagreSvgCommand implements Command {
  private static readonly id = "argdown.exportContentToDagreSvg";
  public readonly id = ExportContentToDagreSvgCommand.id;

  constructor() {}

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportContentToDagreSvgCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri, content: string) {
    saveExportedFile(resource, content, { SVG: ["svg"] }, "svg");
  }
}
export class ExportContentToDagrePngCommand implements Command {
  private static readonly id = "argdown.exportContentToDagrePng";
  public readonly id = ExportContentToDagrePngCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportContentToDagrePngCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri, content: string) {
    savePng(resource, content);
  }
}
export class ExportContentToDagrePdfCommand implements Command {
  private static readonly id = "argdown.exportContentToDagrePdf";
  public readonly id = ExportContentToDagrePdfCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportContentToDagrePdfCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri, content: string) {
    sendToLanguageServer(
      resource,
      content,
      { PDF: ["pdf"] },
      "pdf",
      "dagre-to-pdf"
    );
  }
}
