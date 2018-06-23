import * as vscode from 'vscode';

import { ArgdownPreviewManager } from './ArgdownPreviewManager';

export enum ArgdownPreviewSecurityLevel {
	Strict = 0,
	AllowInsecureContent = 1,
	AllowScriptsAndAllContent = 2,
	AllowInsecureLocalContent = 3
}

export interface ContentSecurityPolicyArbiter {
	getSecurityLevelForResource(resource: vscode.Uri): ArgdownPreviewSecurityLevel;

	setSecurityLevelForResource(resource: vscode.Uri, level: ArgdownPreviewSecurityLevel): Thenable<void>;

	shouldAllowSvgsForResource(resource: vscode.Uri): void;

	shouldDisableSecurityWarnings(): boolean;

	setShouldDisableSecurityWarning(shouldShow: boolean): Thenable<void>;
}

export class ExtensionContentSecurityPolicyArbiter implements ContentSecurityPolicyArbiter {
	private readonly old_trusted_workspace_key = 'trusted_preview_workspace:';
	private readonly security_level_key = 'preview_security_level:';
	private readonly should_disable_security_warning_key = 'preview_should_show_security_warning:';

	constructor(
		private readonly globalState: vscode.Memento,
		private readonly workspaceState: vscode.Memento
	) { }

	public getSecurityLevelForResource(resource: vscode.Uri): ArgdownPreviewSecurityLevel {
		// Use new security level setting first
		const level = this.globalState.get<ArgdownPreviewSecurityLevel | undefined>(this.security_level_key + this.getRoot(resource), undefined);
		if (typeof level !== 'undefined') {
			return level;
		}

		// Fallback to old trusted workspace setting
		if (this.globalState.get<boolean>(this.old_trusted_workspace_key + this.getRoot(resource), false)) {
			return ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent;
		}
		return ArgdownPreviewSecurityLevel.Strict;
	}

	public setSecurityLevelForResource(resource: vscode.Uri, level: ArgdownPreviewSecurityLevel): Thenable<void> {
		return this.globalState.update(this.security_level_key + this.getRoot(resource), level);
	}

	public shouldAllowSvgsForResource(resource: vscode.Uri) {
		const securityLevel = this.getSecurityLevelForResource(resource);
		return securityLevel === ArgdownPreviewSecurityLevel.AllowInsecureContent || securityLevel === ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent;
	}

	public shouldDisableSecurityWarnings(): boolean {
		return this.workspaceState.get<boolean>(this.should_disable_security_warning_key, false);
	}

	public setShouldDisableSecurityWarning(disabled: boolean): Thenable<void> {
		return this.workspaceState.update(this.should_disable_security_warning_key, disabled);
	}

	private getRoot(resource: vscode.Uri): vscode.Uri {
		if (vscode.workspace.workspaceFolders) {
			const folderForResource = vscode.workspace.getWorkspaceFolder(resource);
			if (folderForResource) {
				return folderForResource.uri;
			}

			if (vscode.workspace.workspaceFolders.length) {
				return vscode.workspace.workspaceFolders[0].uri;
			}
		}

		return resource;
	}
}

export class PreviewSecuritySelector {

	public constructor(
		private readonly cspArbiter: ContentSecurityPolicyArbiter,
		private readonly webviewManager: ArgdownPreviewManager
	) { }

	public async showSecuritySelectorForResource(resource: vscode.Uri): Promise<void> {
		interface PreviewSecurityPickItem extends vscode.QuickPickItem {
			readonly type: 'moreinfo' | 'toggle' | ArgdownPreviewSecurityLevel;
		}

		function markActiveWhen(when: boolean): string {
			return when ? '• ' : '';
		}

		const currentSecurityLevel = this.cspArbiter.getSecurityLevelForResource(resource);
		const selection = await vscode.window.showQuickPick<PreviewSecurityPickItem>(
			[
				{
					type: ArgdownPreviewSecurityLevel.Strict,
					label: markActiveWhen(currentSecurityLevel === ArgdownPreviewSecurityLevel.Strict) + 'Strict',
					description: 'Only load secure content',
				}, {
					type: ArgdownPreviewSecurityLevel.AllowInsecureLocalContent,
					label: markActiveWhen(currentSecurityLevel === ArgdownPreviewSecurityLevel.AllowInsecureLocalContent) + 'Allow insecure local content',
					description: 'Enable loading content over http served from localhost',
				}, {
					type: ArgdownPreviewSecurityLevel.AllowInsecureContent,
					label: markActiveWhen(currentSecurityLevel === ArgdownPreviewSecurityLevel.AllowInsecureContent) + 'Allow insecure content',
					description: 'Enable loading content over http',
				}, {
					type: ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent,
					label: markActiveWhen(currentSecurityLevel === ArgdownPreviewSecurityLevel.AllowScriptsAndAllContent) + 'Disable',
					description: 'Allow all content and script execution. Not recommended',
				}, {
					type: 'moreinfo',
					label: 'More Information',
					description: ''
				}, {
					type: 'toggle',
					label: this.cspArbiter.shouldDisableSecurityWarnings()
						? "Enable preview security warnings in this workspace"
						: "Disable preview security warning in this workspace",
					description: 'Does not affect the content security level'
				},
			], {
				placeHolder: 'Select security settings for Argdown previews in this workspace',
			});
		if (!selection) {
			return;
		}

		if (selection.type === 'moreinfo') {
			vscode.commands.executeCommand('vscode.open', vscode.Uri.parse('https://go.microsoft.com/fwlink/?linkid=854414'));
			return;
		}

		if (selection.type === 'toggle') {
			this.cspArbiter.setShouldDisableSecurityWarning(!this.cspArbiter.shouldDisableSecurityWarnings());
			return;
		} else {
			await this.cspArbiter.setSecurityLevelForResource(resource, selection.type);
		}
		this.webviewManager.refresh();
	}
}
