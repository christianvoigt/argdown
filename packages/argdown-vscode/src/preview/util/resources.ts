import * as vscode from "vscode";

export interface WebviewResourceProvider {
  asWebviewUri(resource: vscode.Uri): vscode.Uri;

  readonly cspSource: string;
}
