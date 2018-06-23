import { Command } from './Command';
import { ArgdownPreviewManager } from '../preview/ArgdownPreviewManager';

export class RefreshPreviewCommand implements Command {
	public readonly id = 'argdown.preview.refresh';

	public constructor(
		private readonly webviewManager: ArgdownPreviewManager
	) { }

	public execute() {
		this.webviewManager.refresh();
	}
}