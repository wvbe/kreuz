import { Attachable } from '../classes/Attachable.ts';
import { Event } from '../classes/Event.ts';
import { EventedValue } from '../classes/EventedValue.ts';
import Game from '../Game.ts';
import { DriverI } from './types.ts';

export class Driver extends Attachable<[Game]> implements DriverI {
	public readonly $$animating = new EventedValue<boolean>(false, 'Driver $$animating');

	public readonly $resume = new Event('Driver $resume');

	public readonly $pause = new Event('Driver $pause');
	public readonly $end = new Event('Driver $end');

	public constructor() {
		super();

		this.$attach.on((game) => {
			this.$detach.once(
				// Whenever the driver starts/stops animating, start/stop the game too.
				this.$resume.on(async () => {
					await game.start();
				}),
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
	public async start(): Promise<void> {
		if (this.$$animating.get()) {
			throw new Error('Animation already started');
		}
		await this.$$animating.set(true);
		await this.$resume.emit();
	}

	public async stop(): Promise<void> {
		if (!this.$$animating.get()) {
			throw new Error('Animation not started');
		}
		await this.$$animating.set(false);
		await this.$pause.emit();
	}

	public async startUntilStop(): Promise<void> {
		return new Promise<void>(async (res) => {
			this.$end.once(res);
			await this.start();
		});
	}
}
