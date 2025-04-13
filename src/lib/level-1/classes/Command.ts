export class Command<Context> {
	public readonly label: string;
	public readonly isAllowed: (context: Context) => boolean;
	public readonly execute: (context: Context) => void;
	constructor(
		label: string,
		isAllowed: (context: Context) => boolean,
		execute: (context: Context) => void,
	) {
		this.label = label;
		this.isAllowed = isAllowed;
		this.execute = execute;
	}
}
