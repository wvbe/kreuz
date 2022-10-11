import Logger from '../classes/Logger.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';
import Game from '../Game.ts';
import { ControllerI } from '../types.ts';
import { Controller } from './Controller.ts';

type HeadlessControllerOptions = {
	delayBetweenJumps: number;
};

/**
 * A controller without a visible DOM or ThreeJS world. Probably only useful for testing.
 *
 * Will progress time as fast as it can.
 */
export class HeadlessController extends Controller implements ControllerI {
	options: HeadlessControllerOptions;

	constructor(options: HeadlessControllerOptions) {
		super();
		this.options = options;
	}

	public attachToGame(game: Game): void {
		super.attachToGame(game);

		this.$detach.once(
			this.$start.on(async () => {
				while (this.$$animating.get() && game.time.hasNextEvent()) {
					game.time.jump();
					if (this.options.delayBetweenJumps) {
						await new Promise((res) => setTimeout(res, this.options.delayBetweenJumps));
					}
				}
				Logger.log('Amicable end of the animation loop');
				this.stopAnimationLoop();
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
	}
}
