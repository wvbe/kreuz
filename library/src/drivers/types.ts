import { Attachable } from '../classes/Attachable.ts';
import { type Event } from '../classes/Event.ts';
import { type EventedValue } from '../classes/EventedValue.ts';
import type Game from '../Game.ts';

export interface DriverI extends Attachable {
	/**
	 * Triggers whenever the driver animation loop is started or stopped.
	 *
	 * @deprecated This value should probably be private to the driver.
	 */
	$$animating: EventedValue<boolean>;
	/**
	 * Triggers whenever the driver animation loop is started.
	 */
	$start: Event<[]>;
	/**
	 * Associate a game with this driver, meaning that you'll probably want to set a lot
	 * of event handlers.
	 */
	// attach(game: Game): this;
	/**
	 * Remove any association between the game and this driver.
	 */
	// detach(): void;
	/**
	 * Start the concept of time, and any events or animation following it.
	 *
	 * Returns a promise that resolves when the animation ends.
	 */
	start(): Promise<void>;
	/**
	 * Stop the animation loop, the opposite of startAnimationLoop(). Will also fire the opposite event.
	 */
	stop(): void;
}
