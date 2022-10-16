import { PersonEntity } from '../entities/PersonEntity.ts';
import Game from '../Game.ts';
import { Driver } from './Driver.ts';
import { DriverI } from './types.ts';

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
			.filter<PersonEntity>((entity) => entity instanceof PersonEntity)
			.forEach((entity) => {
				this.$detach.once(
					entity.$stepStart.on((_destination, duration, done) => {
						game.time.setTimeout(() => {
							// @TODO This should be a method on the entity, so that foreign code doesn't
							// need to emit an entity event.
							done();
						}, duration);
					}),
				);
			});

		return this;
	}
}
