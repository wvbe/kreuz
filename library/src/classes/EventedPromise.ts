import { type DestroyerFn } from '../../mod.ts';
import { Event } from './Event.ts';

/**
 * A utility wrapper around a new promise that binds the resolution or rejection of that promises to
 * events.
 *
 * Call eventedPromise.$finish to resolve, or eventedPromise.$interrupt to cancel.
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
export class EventedPromise {
	public readonly $finish: Event<unknown[]>;

	public readonly $interrupt: Event<unknown[]>;

	public readonly promise: Promise<void>;

	#done = false;

	constructor($finish?: Event<unknown[]>, $interrupt?: Event<unknown[]>) {
		this.$finish = $finish || new Event(`${this.constructor.name} $finish`);
		this.$interrupt = $interrupt || new Event(`${this.constructor.name} $interrupt`);
		this.promise = new Promise<void>((resolve, reject) => {
			// deno-lint-ignore prefer-const
			let stopListeningForInterrupt: DestroyerFn;
			const stopListeningForFinish = this.$finish.once(() => {
				if (this.#done) {
					// Programmer error:
					throw new Error('EventedPromise can only close once, unexpected finish');
				}
				this.#done = true;
				resolve();
				stopListeningForInterrupt();
			});
			// @TODO maybe send information on the reason to reject
			stopListeningForInterrupt = this.$interrupt.once(() => {
				if (this.#done) {
					// Programmer error:
					throw new Error('EventedPromise can only close once, unexpected interrupt');
				}
				this.#done = true;
				stopListeningForFinish();
				// REJECT?
				resolve();
			});
		});
	}

	start() {}
}
