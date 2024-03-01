import { type CallbackFn, type DestroyerFn } from '../types.ts';
import { Event } from './Event.ts';

export class EventCombination extends Event<any[]> {
	#events: Event<any[]>[];

	public constructor(label: string, events: Event<any[]>[]) {
		super(label);
		this.#events = events;
	}

	/**
	 * Wait for this event to trigger and run the callback every time it does.
	 *
	 * Returns a function with which the event listener is removed again.
	 */
	public on(callback: CallbackFn<any[]>): DestroyerFn {
		const destroyers = this.#events.map((event) => event.on(callback));
		return () => {
			for (let i = 0; i < destroyers.length; i++) {
				destroyers[i]();
			}
		};
	}

	/**
	 * Wait for this event to trigger and run the callback only the first time it does.
	 *
	 * Returns a function with which the event listener is removed again.
	 */
	public once(callback: CallbackFn<any[]>): DestroyerFn {
		const destroyers = this.#events.map((event) => event.once(callback));
		return () => {
			for (let i = 0; i < destroyers.length; i++) {
				destroyers[i]();
			}
		};
	}

	/**
	 * Trigger all callbacks that were waiting for this event.
	 */
	public async emit(...args: any[]): Promise<void> {
		for (const event of this.#events) {
			await event.emit(...args);
		}
	}

	/**
	 * Remove all listeners to this event.
	 */
	public clear() {
		for (const event of this.#events) {
			event.clear();
		}
	}
}
