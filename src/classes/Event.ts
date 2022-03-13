import Logger from './Logger';

export class Event<Args extends unknown[] = []> {
	private callbacks: ((...args: Args) => void)[] = [];
	private name?: string;

	constructor(debugName?: string) {
		this.name = debugName;
	}

	on(callback: (...args: Args) => void): () => void {
		const cancel = () => {
			// console.log('Cancel Event#on');
			this.callbacks.splice(this.callbacks.indexOf(callback), 1);
		};
		this.callbacks.push(callback);
		return cancel;
	}

	once(callback: (...args: Args) => void): () => void {
		const run = (...args: Args) => {
			callback(...args);
			cancel();
		};
		const cancel = () => {
			// console.log('Cancel Event#once');
			this.callbacks.splice(this.callbacks.indexOf(run), 1);
		};
		this.callbacks.push(run);
		return cancel;
	}

	emit(...args: Args): void {
		if (this.name && process.env.NODE_ENV !== 'test') {
			// For debugging purposes only
			Logger.groupCollapsed(`🔔 ${this.name}`);
		}
		this.callbacks.forEach(cb => cb(...args));
		if (this.name && process.env.NODE_ENV !== 'test') {
			Logger.groupEnd();
		}
	}

	static onAny(callback: () => void, events: Event[]) {
		const destroyers = events.map(event => event.on(callback));
		const destroy = () => {
			// console.log('Destroy Event.onAny');
			destroyers.forEach(destroy => destroy());
		};
		return destroy;
	}

	static onceFirst(callback: () => void, events: Event[]) {
		const destroyers: (() => void)[] = [];
		const destroy = () => {
			// console.log('Destroy Event.onceFirst');
			destroyers.forEach(destroy => destroy());
		};
		const cb = () => {
			callback();
			destroyers.forEach(destroy => destroy());
		};
		events.forEach(event => {
			destroyers.push(event.once(cb));
		});
		return destroy;
	}

	clear() {
		// console.log('Event#clear on "' + this.name + '"');
		this.callbacks = [];
	}
}
