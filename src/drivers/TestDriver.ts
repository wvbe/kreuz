import Logger from '../classes/Logger.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';
import Game from '../Game.ts';
import { DriverI } from './types.ts';
import { Driver } from './Driver.ts';

type TestDriverOptions = {
	delayBetweenJumps: number;
};

/**
 * A driver without a visible DOM or ThreeJS world. Probably only useful for testing.
 *
 * Will progress time as fast as it can.
 */
export class TestDriver extends Driver implements DriverI {
	options: TestDriverOptions;

	constructor(options: TestDriverOptions = { delayBetweenJumps: 0 }) {
		super();
		this.options = options;
	}

	public attach(game: Game): this {
		super.attach(game);

		this.$detach.once(
			this.$start.on(async () => {
				while (this.$$animating.get() && game.time.hasNextEvent()) {
					game.time.jump();
					if (this.options.delayBetweenJumps) {
						await new Promise((res) => setTimeout(res, this.options.delayBetweenJumps));
					}
				}
				this.stop();
			}),
		);

		// Whenever an entity starts to move, make sure that the "animation" ends at some point too.
		game.entities
			.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
			.forEach((entity) => {
				this.$detach.once(
					entity.$stepStart.on((destination, duration) => {
						game.time.setTimeout(() => {
							entity.$stepEnd.emit(destination);
						}, duration);
					}),
				);
			});

		return this;
	}
}
