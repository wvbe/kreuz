import { Random } from '../classes/Random.ts';
import type Game from '../Game.ts';
import { type JobI } from './types.ts';
import { Job } from './Job.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import { type DestroyerFn } from '../types.ts';

/**
 * Loitering is being generally useless to society -- moving from tile to tile every once in a while.
 *
 * It is not quite the same as having _no_ job, which would mean the entity does not even move.
 */
export class LoiterJob extends Job<PersonEntity> implements JobI {
	// The minimum and maximum amounts of ms before considering to move again, after having walked
	private walkMinWait = 4000;
	private walkMaxWait = 15000;

	// Every time that the entity might make a move, there's a good chance that they'll change their
	//   mind and lazy out instead.
	private walkChanceOnRoll = 0.3;

	// If the entity chooses to walk, its no more than this amount of times
	private walkMaxDistance = 3;

	constructor(entity: PersonEntity) {
		super();

		let clearTimer: DestroyerFn | null = null;

		const doTimeout = (game: Game) => {
			if (clearTimer) {
				throw new Error('Timer for LoiterJob already exists');
			}
			let steps = 0;
			clearTimer = game.time.setTimeout(() => {
				clearTimer = null;
				if (Random.boolean([entity.id, 'strp', steps], this.walkChanceOnRoll)) {
					doTimeout(game);
					return;
				}
				steps++;
				const currentLocation = entity.$$location.get();
				const destinations = game.terrain
					.selectClosestTiles(currentLocation, this.walkMaxDistance)
					.filter((destination) => !currentLocation.equals(destination));
				entity.walkToTile(Random.fromArray(destinations, entity.id, 'roam-destination', steps));
			}, this.walkMinWait + Random.float(entity.id, 'roam-delay', steps) * (this.walkMaxWait - this.walkMinWait));
		};

		this.$attach.on((game) => {
			doTimeout(game);
			this.$detach.once(entity.$pathEnd.on(() => doTimeout(game)));
			this.$detach.once(() => clearTimer?.());
		});
	}

	get label() {
		return `Wandering around aimlessly…`;
	}
}
