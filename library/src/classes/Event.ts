import { type CallbackFn, type DestroyerFn } from '../types.ts';
import Logger from './Logger.ts';

export class Event<Args extends unknown[] = []> {
	#callbacks: CallbackFn<Args>[] = [];
	protected label: string;
	protected debug: boolean;

	public constructor(label: string, debug?: boolean) {
		this.label = label;
		this.debug = !!debug;
	}

	/**
	 * Wait for this event to trigger and run the callback every time it does.
	 */
	public on(callback: CallbackFn<Args>): DestroyerFn {
		if (typeof callback !== 'function') {
			throw new Error(
				`Expected callback of Event(${
					this.label ? `'${this.label}'` : ''
				})#on to be a function, received ${callback}`,
			);
		}
		const cancel = () => {
			const index = this.#callbacks.indexOf(callback);
			if (index === -1) {
				// Already destroyed
				return;
			}
			this.#callbacks.splice(index, 1);
		};
		this.#callbacks.push(callback);
		return cancel;
	}

	/**
	 * Wait for this event to trigger and run the callback only the first time it does.
	 */
	public once(callback: CallbackFn<Args>): DestroyerFn {
		if (typeof callback !== 'function') {
			throw new Error(
				`Expected callback of Event(${
					this.label ? `'${this.label}'` : ''
				})#once to be a function, received ${callback}`,
			);
		}
		const run = (...args: Args) => {
			callback(...args);
			cancel();
		};
		this.#callbacks.push(run);
		const cancel = () => {
			const index = this.#callbacks.indexOf(run);
			if (index === -1) {
				// Already destroyed
				return;
			}
			this.#callbacks.splice(index, 1);
		};
		return cancel;
	}

	/**
	 * Trigger all callbacks that were waiting for this event.
	 */
	public emit(...args: Args): void {
		if (this.debug) {
			Logger.group(`🔔 ${this.label} (${this.#callbacks.length})`);
		}

		// Create a new array from callbacks so that the loop is not affected
		// while once-ers change the true callbacks list by reference.
		this.#callbacks.slice().forEach(function callListenerCallbacks(cb, _i) {
			cb(...args);
		});
		if (this.debug) {
			Logger.groupEnd();
		}
	}

	/**
	 * Set a callback for multiple events.
	 *
	 * @deprecated Not in use yet
	 */
	public static onAny(callback: CallbackFn, events: Event[]): DestroyerFn {
		const destroyers = events.map((event) => event.on(callback));
		const destroy = () => {
			destroyers.forEach((destroy) => destroy());
		};
		return destroy;
	}

	/**
	 * @deprecated Not in use yet
	 */
	public static onceFirst(callback: CallbackFn, events: Event[]): DestroyerFn {
		const destroyers: DestroyerFn[] = [];
		const destroy = () => {
			destroyers.forEach((destroy) => destroy());
		};
		const cb = () => {
			callback();
			destroyers.forEach((destroy) => destroy());
		};
		events.forEach((event) => {
			destroyers.push(event.once(cb));
		});
		return destroy;
	}

	public clear() {
		this.#callbacks = [];
	}
}
