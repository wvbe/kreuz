import { CallbackFn } from '../types.ts';
import { DestroyerFn } from '../types.ts';

/**
 * Something that can be listened to, because it emits events somehow.
 */
export type EventEmitterI<Args extends unknown[] = []> = {
	on(callback: CallbackFn<Args>): DestroyerFn;
	once(callback: CallbackFn<Args>): DestroyerFn;
	clear(): void;
};

/**
 * Something that can emit at an event.
 */
export type EventListenerI<Args extends unknown[] = []> = {
	emit(...args: Args): Promise<void>;
};

/**
 * Something that can be listened to, and can emit events.
 */
export type EventI<Args extends unknown[] = []> = EventEmitterI<Args> & EventListenerI<Args>;
