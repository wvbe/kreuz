import { Attachable } from '../classes/Attachable.ts';
import { Event } from '../classes/Event.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import Game from '../Game.ts';
import { DriverI } from './types.ts';

export class Driver extends Attachable<[Game]> implements DriverI {
	public readonly game = null;

	/**
	 * @deprecated This value should probably be private to the driver, therefore needs to be moved.
	 */
	public $$animating = new EventedValue<boolean>(false, 'Driver $$animating');
	public readonly $start = new Event('Driver $start');
	public readonly $stop = new Event('Driver $stop');
	constructor() {
		super();

		this.$attach.on((game) => {
			this.$detach.once(
				// Whenever the driver starts/stops animating, start/stop the game too.
				this.$start.on(() => game.start()),
			);

			// Whenever the driver detaches, destroy the game.
			// @TODO maybe not.
			this.$detach.once(game.stop.bind(game));

			return this;
		});
	}

	/**
	 * @TODO should not return a promise, more like return destroyer
	 * @TODO invent .run() in case you want a promise-based async?
	 */
	start(): Promise<void> {
		if (this.$$animating.get()) {
			throw new Error('Animation already started');
		}
		this.$$animating.set(true);
		return new Promise((resolve) => {
			this.$stop.once(() => resolve());
			this.$start.emit();
		});
	}

	public stop() {
		if (!this.$$animating.get()) {
			throw new Error('Animation not started');
		}
		this.$$animating.set(false);
		this.$stop.emit();
	}
}
