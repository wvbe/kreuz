import { type CallbackFn, type DestroyerFn } from '../types.ts';

export class Event<Args extends unknown[] = []> {
	#callbacks: CallbackFn<Args>[] = [];

	protected label: string;

	public constructor(label: string) {
		this.label = label;
	}

	/**
	 * @deprecated Here for test purposes only/
	 */
	get $$$listeners() {
		return this.#callbacks.length;
	}

	/**
	 * Wait for this event to trigger and run the callback every time it does.
	 *
	 * Returns a function with which the event listener is removed again.
	 */
	public on(callback: CallbackFn<Args>): DestroyerFn {
		if (typeof callback !== 'function') {
			// This error should be prevented by TypeScripts type checking. However, you might not
			// be using TS (or paying attention), and this bug will then not be discovered until the
			// event is actually triggered. It is therefore nicer to just check right away.
			throw new Error(
				`Expected callback of Event(${
					this.label ? `'${this.label}'` : ''
				})#on to be a function, received ${callback}`,
			);
		}
		const cancel = () => {
			const index = this.#callbacks.indexOf(callback);
			if (index === -1) {
				console.warn(
					`Destroying an event listener that was already destroyed, you may have a memory leak.`,
				);
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
	 *
	 * Returns a function with which the event listener is removed again.
	 */
	public once(callback: CallbackFn<Args>): DestroyerFn {
		if (typeof callback !== 'function') {
			// This error should be prevented by TypeScripts type checking. However, you might not
			// be using TS (or paying attention), and this bug will then not be discovered until the
			// event is actually triggered. It is therefore nicer to just check right away.
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
				console.warn(
					`Destroying an event listener that was already destroyed, you may have a memory leak.`,
				);
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
		// Create a new array from callbacks so that the loop is not affected
		// while once-ers change the true callbacks list by reference.
		//
		// Use a `for` loop to have one less useless line of stack tracing
		const callbacks = this.#callbacks.slice();
		for (let i = 0; i < callbacks.length; i++) {
			callbacks[i](...args);
		}
	}

	/**
	 * Set a callback for any time any of multiple events emit.
	 *
	 * @todo test
	 * @deprecated Untested
	 */
	public static onAny<Args extends unknown[] = []>(
		callback: CallbackFn<Args>,
		events: Event<Args>[],
	): DestroyerFn {
		const destroyers = events.map((event) => event.on(callback));
		const destroy = () => {
			for (let i = 0; i < destroyers.length; i++) {
				destroyers[i]();
			}
		};
		return destroy;
	}

	/**
	 * Set a callback for only the first time any of the given events emit.
	 * @todo test
	 * @deprecated Not in use yet
	 */
	public static onceFirst(callback: CallbackFn, events: Event[]): DestroyerFn {
		const destroyers: DestroyerFn[] = [];
		const destroy = () => {
			for (let i = 0; i < destroyers.length; i++) {
				destroyers[i]();
			}
		};
		const cb = () => {
			callback();
			for (let i = 0; i < destroyers.length; i++) {
				destroyers[i]();
			}
		};
		events.forEach((event) => {
			destroyers.push(event.once(cb));
		});
		return destroy;
	}

	/**
	 * Remove all listeners to this event.
	 */
	public clear() {
		this.#callbacks = [];
	}
}
