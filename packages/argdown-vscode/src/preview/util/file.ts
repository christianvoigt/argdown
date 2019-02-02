import * as vscode from 'vscode';

export function isArgdownFile(document: vscode.TextDocument) {
	return document.languageId === 'argdown';
}