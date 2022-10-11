import { Event } from '../classes/Event.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import Game from '../Game.ts';
import { DriverI } from './types.ts';

export class Driver implements DriverI {
	/**
	 * @deprecated This value should probably be private to the driver, therefore needs to be moved.
	 */
	public $$animating = new EventedValue<boolean>(false, 'Driver $$animating');
	public readonly $start = new Event('Driver $start');
	public readonly $stop = new Event('Driver $stop');
	public readonly $attach = new Event('Driver $attach');
	public readonly $detach = new Event('Driver $detach');

	public attach(game: Game): this {
		this.$attach.emit();

		this.$detach.once(
			// Whenever the driver starts/stops animating, start/stop the game too.
			this.$start.on(() => game.start()),
		);

		// Whenever the driver detaches, destroy the game.
		// @TODO maybe not.
		this.$detach.once(game.destroy.bind(game));

		return this;
	}
	public detach() {
		this.$detach.emit();
	}

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
