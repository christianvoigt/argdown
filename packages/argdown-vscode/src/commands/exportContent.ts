import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { Command } from "./Command";
import { isArgdownFile } from "../preview/util/file";
import { Logger } from "../preview/Logger";

export interface IExportContentArgs {
  content: string;
  target: vscode.Uri;
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
    if (doc.uri.scheme !== "file" || !isArgdownFile(doc)) {
      return;
    }
    uri = doc.uri;
  }
  if (!uri) {
    return;
  }
  const filePath: string = uri.fsPath;
  const fileDir: string = path.dirname(filePath);
  const extension: string = path.extname(filePath);
  const fileName: string = path.basename(filePath, extension);
  const defaultUri = vscode.Uri.file(
    path.resolve(fileDir, fileName + "." + defaultExtension)
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
    fs.writeFile(fileUri.fsPath, content, function(err) {
      if (err) {
        return console.log(err);
      }
    });
  }
};
const savePng = async (resource: vscode.Uri, content: string) => {
  var fileUri = await getTargetFileUri(resource, { PNG: ["png"] }, "png");
  if (fileUri) {
    var data = content.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, "base64");
    fs.writeFile(fileUri.fsPath, buf, function(err) {
      if (err) {
        return console.log(err);
      }
    });
  }
};
const sendToLanguageServer = async (
  resource: vscode.Uri,
  content: string,
  filters: { [name: string]: string[] },
  defaultExtension: string,
  process: string
) => {
  var fileUri = await getTargetFileUri(resource, filters, defaultExtension);
  if (fileUri) {
    const args: IExportContentArgs = {
      content,
      target: fileUri,
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

  constructor(private logger: Logger) {}

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportContentToDagreSvgCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri, content: string) {
    this.logger.log("executing ExportContentToDagreSvg");
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
      "dagre-to-pdf",
      "pdf"
    );
  }
}
