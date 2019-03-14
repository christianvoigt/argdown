import { ArgdownEngine } from "./ArgdownEngine";
import { ArgdownPreviewConfiguration } from "./ArgdownPreviewConfiguration";
import { IArgdownPreviewState } from "./IArgdownPreviewState";
import * as vscode from "vscode";
export interface IViewProvider {
  generateView(
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration,
    nonce: string
  ): Promise<string>;
  generateSubMenu(): string;
  generateOnDidChangeTextDocumentMessage(
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<any>;
  contributeToInitialState(
    data: IArgdownPreviewState,
    argdownEngine: ArgdownEngine,
    argdownDocument: vscode.TextDocument,
    config: ArgdownPreviewConfiguration
  ): Promise<IArgdownPreviewState>;
  scripts: string[];
}
