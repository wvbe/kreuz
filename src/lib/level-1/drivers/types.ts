import { Attachable } from '../classes/Attachable';
import { Prompt } from '../classes/Prompt';
import { type Event } from '../events/Event';
import { type EventedValue } from '../events/EventedValue';

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
	$resume: Event<[]>;

	/**
	 * The game asks the user for something.
	 */
	$prompt: Event<
		[
			{
				id: Prompt<any>;
				resolve: (result: any) => void;
				reject: (error?: Error) => void;
			},
		]
	>;

	/**
	 * Start the concept of time, and any events or animation following it.
	 *
	 * Returns a promise that resolves when the "start" handlers have finished.
	 */
	start(): Promise<void>;

	/**
	 * Stop the animation loop. Returns a promise that resolves when all the "stop"-handlers have
	 * finished.
	 */
	stop(): Promise<void>;

	/**
	 * Same as {@link DriverI.start}, but does not resolve until the game finishes.
	 */
	startUntilStop(): Promise<void>;
}
