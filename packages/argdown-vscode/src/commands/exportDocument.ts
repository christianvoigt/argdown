import * as vscode from "vscode";
import * as path from "path";
import { Command } from "./Command";
import { isArgdownFile } from "../preview/util/file";

export interface IExportDocumentArgs {
  source: string;
  target: string;
  process: string;
}

const executeExport = async (
  resource: vscode.Uri,
  filters: { [name: string]: string[] },
  process: string,
  defaultExtension: string
) => {
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
  const fileUri = await vscode.window.showSaveDialog(option);
  if (fileUri) {
    const args: IExportDocumentArgs = {
      source: uri.toString(),
      target: fileUri.toString(),
      process: process
    };
    vscode.commands.executeCommand("argdown.server.exportDocument", args);
  }
};

export class ExportDocumentToHtmlCommand implements Command {
  private static readonly id = "argdown.exportDocumentToHtml";
  public readonly id = ExportDocumentToHtmlCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToHtmlCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(resource, { HTML: ["html"] }, "html", "html");
  }
}
export class ExportDocumentToJsonCommand implements Command {
  private static readonly id = "argdown.exportDocumentToJson";
  public readonly id = ExportDocumentToJsonCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToJsonCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(resource, { JSON: ["json"] }, "json", "json");
  }
}
export class ExportDocumentToDotCommand implements Command {
  private static readonly id = "argdown.exportDocumentToDot";
  public readonly id = ExportDocumentToDotCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToDotCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(resource, { Dot: ["dot"] }, "dot", "dot");
  }
}
export class ExportDocumentToGraphMLCommand implements Command {
  private static readonly id = "argdown.exportDocumentToGraphML";
  public readonly id = ExportDocumentToGraphMLCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToGraphMLCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(resource, { graphml: ["graphml"] }, "graphml", "graphml");
  }
}
export class ExportDocumentToVizjsSvgCommand implements Command {
  private static readonly id = "argdown.exportDocumentToVizjsSvg";
  public readonly id = ExportDocumentToVizjsSvgCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToVizjsSvgCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(resource, { SVG: ["svg"] }, "vizjs-to-svg", "svg");
  }
}
export class ExportDocumentToWebComponentCommand implements Command {
  private static readonly id = "argdown.exportDocumentToWebComponent";
  public readonly id = ExportDocumentToWebComponentCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToWebComponentCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(
      resource,
      { HTML: ["component.html"] },
      "web-component-to-html",
      "component.html"
    );
  }
}
export class ExportDocumentToVizjsPdfCommand implements Command {
  private static readonly id = "argdown.exportDocumentToVizjsPdf";
  public readonly id = ExportDocumentToVizjsPdfCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${ExportDocumentToVizjsPdfCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    executeExport(resource, { PDF: ["pdf"] }, "vizjs-to-pdf", "pdf");
  }
}
