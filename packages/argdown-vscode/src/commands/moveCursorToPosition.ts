import * as vscode from 'vscode';

import { Command } from './Command';

export class MoveCursorToPositionCommand implements Command {
	public readonly id = '_argdown.moveCursorToPosition';

	public execute(line: number, character: number) {
		if (!vscode.window.activeTextEditor) {
			return;
		}
		const position = new vscode.Position(line, character);
		const selection = new vscode.Selection(position, position);
		vscode.window.activeTextEditor.revealRange(selection);
		vscode.window.activeTextEditor.selection = selection;
	}
}
