import * as vscode from 'vscode';
import { Command } from './Command';
import { ArgdownPreviewManager } from '../preview/ArgdownPreviewManager';

export class ShowSourceCommand implements Command {
	public readonly id = 'argdown.showSource';

	public constructor(
		private readonly previewManager: ArgdownPreviewManager
	) { }

	public execute() {
		if (this.previewManager.activePreviewResource) {
			return vscode.workspace.openTextDocument(this.previewManager.activePreviewResource)
				.then(document => vscode.window.showTextDocument(document));
		}
		return undefined;
	}
}