import { pathingComponent } from '../level-1/ecs/components/pathingComponent.ts';
import Game from '../level-1/Game.ts';
import { EcsEntity } from '../level-1/ecs/types.ts';
import { DestroyerFn } from '../level-1/types.ts';
import { Driver } from '../level-1/drivers/Driver.ts';
import { DriverI } from '../level-1/drivers/types.ts';
import { byEcsComponents } from '../level-1/ecs/assert.ts';

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
				await this.$end.emit();
			}),
		);

		const listenToPersonEntityMovement = (entities: EcsEntity[]) => {
			entities.filter(byEcsComponents([pathingComponent])).forEach((entity) => {
				const stepStart = () => {
					const step = entity.$stepStart.get();
					if (!step) {
						return;
					}

					// The step timeout is cancelled when the entity is destroyed. When the step
					// finishes, that timeout cancellor is cancelled too.
					let cancelDestroy: DestroyerFn;
					const cancelStep = game.time.setTimeout(() => {
						cancelDestroy();
						step.done();
					}, step.duration);
					cancelDestroy = this.$detach.once(cancelStep);
				};
				this.$detach.once(entity.$stepStart.on(stepStart));
				if (entity.$stepStart.get()) {
					stepStart();
				}
			});
		};
		// Whenever an entity starts to move, make sure that the "animation" ends at some point too.
		listenToPersonEntityMovement(game.entities.slice());
		this.$detach.once(
			game.entities.$add.on((added) => {
				listenToPersonEntityMovement(added);
			}),
		);

		return this;
	}
}
