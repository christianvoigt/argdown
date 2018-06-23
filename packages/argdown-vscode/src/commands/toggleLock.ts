import { Command } from './Command';
import { ArgdownPreviewManager } from '../preview/ArgdownPreviewManager';

export class ToggleLockCommand implements Command {
	public readonly id = 'argdown.preview.toggleLock';

	public constructor(
		private readonly previewManager: ArgdownPreviewManager
	) { }

	public execute() {
		this.previewManager.toggleLock();
	}
}