import { PersonEntity } from '../entities/entity.person.ts';
import Game from '../Game.ts';
import { DestroyerFn } from '../types.ts';
import { Driver } from './Driver.ts';
import { DriverI } from './types.ts';

/**
 * A driver without a visible DOM or ThreeJS world. Probably only useful for testing.
 *
 * Will progress time as fast as it can.
 */
export class TestDriver extends Driver implements DriverI {
	private game: Game | null = null;

	constructor() {
		super();
	}

	public async attach(game: Game): Promise<this> {
		if (this.game) {
			throw new Error('Driver is already attached to a game');
		}
		this.game = game;
		await super.attach(game);

		this.$detach.once(
			this.$resume.on(async () => {
				while (this.$$animating.get() && game.time.hasNextEvent()) {
					await game.time.step();
				}
				await this.stop();
				await this.$end.emit();
			}),
		);

		// Whenever an entity starts to move, make sure that the "animation" ends at some point too.
		this.$detach.once(
			game.entities.$add.on((added) =>
				added
					.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
					.forEach((entity) => {
						this.$detach.once(
							entity.$stepStart.on((_destination, duration, done) => {
								// The step timeout is cancelled when the entity is destroyed. When the step
								// finishes, that timeout cancellor is cancelled too.
								let cancelDestroy: DestroyerFn;
								const cancelStep = game.time.setTimeout(() => {
									cancelDestroy();
									done();
								}, duration);
								cancelDestroy = this.$detach.once(cancelStep);
							}),
						);
					}),
			),
		);

		return this;
	}
}
