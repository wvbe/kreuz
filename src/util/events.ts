import { DependencyList, useCallback, useEffect } from 'react';

type EventHandler<EventData extends Array<unknown>> = (...args: EventData) => void;
type EventDestroyer = () => void;

/**
 *  Consitutes one named event type
 */
export class Event<EventData extends Array<unknown> = []> {
	private listeners: EventHandler<EventData>[] = [];

	on(callback: EventHandler<EventData>) {
		this.listeners.push(callback);

		return () => {
			this.listeners.splice(this.listeners.indexOf(callback));
		};
	}

	emit(...args: EventData) {
		this.listeners.forEach(callback => callback(...args));
	}

	clear() {
		this.listeners = [];
	}
}

/**
 * A conventience wrapper for `useEffect` specifically for listening to a list of events, and unlistening when the
 * component is unmounted.
 *
 * For example:
 *
 *   useEventListeners(() => [
 *       entity.moveStart.on(coordinate => animatePosition(coordinate)),
 *       entity.moveRest.on(coordinate => console.log('Done'))
 *   ], [entity.moveStart, entity.moveRest]);
 */
export const useEventListeners = (callback: () => EventDestroyer[], deps: DependencyList = []) => {
	const cb = useCallback(
		() => {
			const eventDestroyers = callback();
			return () => eventDestroyers.forEach(d => d());
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		deps
	);
	return useEffect(cb, [cb]);
};
