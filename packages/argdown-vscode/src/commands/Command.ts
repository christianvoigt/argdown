export interface Command {
	readonly id: string;

	execute(...args: any[]): void;
}