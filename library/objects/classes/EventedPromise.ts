import { Event } from './Event.ts';

/**
 * A custom awaiter, meaning an object that behaves like a promise (it can be awaited) but is driven
 * by events, that are in turn probably powered by the game loop.
 *
 * Call eventedPromise.$finish.emit() to resolve, or eventedPromise.$interrupt.emit() to cancel.
 *
 * Finishing or interrupting the promise will clean up listeners and resolve/reject the promise.
 *
 * @remarks
 * On the one hand that makes it easier to wait for existing start/finish pairs -- for example:
 *
 *   // Await that an entity finishes an entire path, or reject when another path is started instead
 *   const { promise } = new EventedPromise(this.$pathEnd, this.$pathStart);
 *
 * Or it makes a promise more easily cancellable from outside the callback scope:
 *
 *   const { $finish, $interrupt, promise } = new EventedPromise();
 *   $someOtherEvent.on(() => $interrupt.emit());
 *   setTimeout(() => $finish.emit(), 1000);
 */

let i = 0;
export class EventedPromise {
	public readonly $finish: Event<unknown[]>;
	public isResolved = false;

	public readonly $interrupt: Event<unknown[]>;
	public isRejected = false;

	id: number;

	constructor($finish?: Event<unknown[]>, $interrupt?: Event<unknown[]>) {
		this.id = ++i;
		this.$finish = $finish || new Event(`${this.constructor.name} $finish`);
		this.$interrupt = $interrupt || new Event(`${this.constructor.name} $interrupt`);
	}

	public isBusy() {
		return !this.isRejected && !this.isResolved;
	}
	resolve() {
		if (this.isResolved || this.isRejected) {
			// Programmer error:
			throw new Error('EventedPromise can only close once, unexpected finish');
		}

		this.isResolved = true;
		this.$finish.emit();

		// Untested
		// return this;
	}

	reject() {
		if (this.isResolved || this.isRejected) {
			// Programmer error:
			throw new Error('EventedPromise can only close once, unexpected interrupt');
		}
		this.isRejected = true;
		this.$interrupt.emit();
	}

	then(onFulfilled: () => void, onRejected?: () => void): EventedPromise {
		if (this.isResolved) {
			onFulfilled();
			return this;
		} else if (this.isRejected) {
			onRejected?.();
			return this;
		}
		this.$finish.once(() => {
			onFulfilled();
		});
		this.$interrupt.once(async () => {
			onRejected?.();
		});
		return this;
	}

	static resolve(): EventedPromise {
		const promise = new EventedPromise();
		promise.resolve();
		return promise;
	}

	static reject(): EventedPromise {
		const promise = new EventedPromise();
		promise.reject();
		return promise;
	}
}
