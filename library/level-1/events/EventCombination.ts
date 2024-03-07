import { type CallbackFn, type DestroyerFn } from '../types.ts';
import { Event } from './Event.ts';
import { EventEmitterI } from './types.ts';

export class EventCombination implements EventEmitterI<[]> {
	#events: Event<any[]>[];

	protected readonly label: string;

	public constructor(label: string, events: Event<any[]>[]) {
		this.label = label;
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
	 * Remove all listeners to this event.
	 */
	public clear() {
		for (const event of this.#events) {
			event.clear();
		}
	}
}
