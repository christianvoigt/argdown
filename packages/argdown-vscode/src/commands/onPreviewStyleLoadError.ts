import * as vscode from 'vscode';

import { Command } from './Command';

export class OnPreviewStyleLoadErrorCommand implements Command {
	public readonly id = '_argdown.onPreviewStyleLoadError';

	public execute(resources: string[]) {
		const resourcesStr = resources.join(', ');
		vscode.window.showWarningMessage(`Could not load 'argdown.styles': ${resourcesStr}`);
	}
}
