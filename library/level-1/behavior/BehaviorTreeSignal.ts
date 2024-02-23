export class BehaviorTreeSignal {
	public readonly type = 'fail';
	public readonly message: string;
	constructor(message: string) {
		this.message = message;
	}
}
