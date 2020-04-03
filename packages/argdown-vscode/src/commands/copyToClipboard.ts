import * as vscode from "vscode";
import { Command } from "./Command";
import { isArgdownFile } from "../preview/util/file";

export interface IReturnDocumentArgs {
  source: string;
  process: string;
}

const execute = async (
  resource: vscode.Uri,
  process: string,
  successMessage: string
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
  const args: IReturnDocumentArgs = {
    source: uri.toString(),
    process: process
  };
  const returnValue = await vscode.commands.executeCommand<string>(
    "argdown.server.returnDocument",
    args
  );

  if (returnValue) {
    await vscode.env.clipboard.writeText(returnValue);
    vscode.window.showInformationMessage(successMessage);
  }
};

export class CopyWebComponentToClipboardCommand implements Command {
  private static readonly id = "argdown.copyWebComponentToClipboard";
  public readonly id = CopyWebComponentToClipboardCommand.id;

  public static createCommandUri(path: string, fragment: string): vscode.Uri {
    return vscode.Uri.parse(
      `command:${CopyWebComponentToClipboardCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }
  public execute(resource: vscode.Uri) {
    execute(
      resource,
      "web-component-to-html",
      `Web component html copied to the clipbard. Paste your component into any html file. For more information on how to use the web component visit the [component's documentation](https://argdown.org/guide/embed-your-map-in-html.html).`
    );
  }
}
