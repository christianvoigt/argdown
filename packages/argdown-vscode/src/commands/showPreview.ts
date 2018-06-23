/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

import { Command } from './Command';
import { ArgdownPreviewManager } from '../preview/ArgdownPreviewManager';
import { PreviewSettings } from '../preview/ArgdownPreview';


function getViewColumn(sideBySide: boolean): vscode.ViewColumn | undefined {
	const active = vscode.window.activeTextEditor;
	if (!active) {
		return vscode.ViewColumn.One;
	}

	if (!sideBySide) {
		return active.viewColumn;
	}

	switch (active.viewColumn) {
		case vscode.ViewColumn.One:
			return vscode.ViewColumn.Two;
		case vscode.ViewColumn.Two:
			return vscode.ViewColumn.Three;
	}

	return active.viewColumn;
}

interface IShowPreviewSettings {
	readonly sideBySide?: boolean;
	readonly locked?: boolean;
}

async function showPreview(
	webviewManager: ArgdownPreviewManager,
	uri: vscode.Uri | undefined,
	previewSettings: IShowPreviewSettings,
): Promise<any> {
	let resource = uri;
	if (!(resource instanceof vscode.Uri)) {
		if (vscode.window.activeTextEditor) {
			// we are relaxed and don't check for argdown files
			resource = vscode.window.activeTextEditor.document.uri;
		}
	}

	if (!(resource instanceof vscode.Uri)) {
		if (!vscode.window.activeTextEditor) {
			// this is most likely toggling the preview
			return vscode.commands.executeCommand('argdown.showSource');
		}
		// nothing found that could be shown or toggled
		return;
	}

	webviewManager.preview(resource, {
		resourceColumn: (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One,
		previewColumn: getViewColumn(!!previewSettings.sideBySide) || vscode.ViewColumn.Active,
		locked: !!previewSettings.locked
	});

}

export class ShowPreviewCommand implements Command {
	public readonly id = 'argdown.showPreview';

	public constructor(
		private readonly webviewManager: ArgdownPreviewManager
	) { }

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[], previewSettings?: PreviewSettings) {
		for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
			showPreview(this.webviewManager, uri, {
				sideBySide: false,
				locked: previewSettings && previewSettings.locked
			});
		}
	}
}

export class ShowPreviewToSideCommand implements Command {
	public readonly id = 'argdown.showPreviewToSide';

	public constructor(
		private readonly webviewManager: ArgdownPreviewManager
	) { }

	public execute(uri?: vscode.Uri, previewSettings?: PreviewSettings) {
		showPreview(this.webviewManager, uri, {
			sideBySide: true,
			locked: previewSettings && previewSettings.locked
		});
	}
}


export class ShowLockedPreviewToSideCommand implements Command {
	public readonly id = 'argdown.showLockedPreviewToSide';

	public constructor(
		private readonly webviewManager: ArgdownPreviewManager
	) { }

	public execute(uri?: vscode.Uri) {
		showPreview(this.webviewManager, uri, {
			sideBySide: true,
			locked: true
		});
	}
}