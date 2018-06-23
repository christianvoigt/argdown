/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from "vscode";
import { Command } from "./Command";
import { PreviewSecuritySelector } from "../preview/security";
import { isArgdownFile } from "../preview/util/file";
import { ArgdownPreviewManager } from "../preview/ArgdownPreviewManager";

export class ShowPreviewSecuritySelectorCommand implements Command {
  public readonly id = "argdown.showPreviewSecuritySelector";

  public constructor(
    private readonly previewSecuritySelector: PreviewSecuritySelector,
    private readonly previewManager: ArgdownPreviewManager
  ) {}

  public execute(resource: string | undefined) {
    if (this.previewManager.activePreviewResource) {
      this.previewSecuritySelector.showSecuritySelectorForResource(
        this.previewManager.activePreviewResource
      );
    } else if (resource) {
      const source = vscode.Uri.parse(resource);
      this.previewSecuritySelector.showSecuritySelectorForResource(
        source.query ? vscode.Uri.parse(source.query) : source
      );
    } else if (
      vscode.window.activeTextEditor &&
      isArgdownFile(vscode.window.activeTextEditor.document)
    ) {
      this.previewSecuritySelector.showSecuritySelectorForResource(
        vscode.window.activeTextEditor.document.uri
      );
    }
  }
}
