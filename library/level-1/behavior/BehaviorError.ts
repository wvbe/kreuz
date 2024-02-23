export class BehaviorError {
	public readonly type = 'behavior';
	public readonly message: string;
	constructor(message: string) {
		this.message = message;
	}
}
