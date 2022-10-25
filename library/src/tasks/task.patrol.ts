import { Random } from '../classes/Random.ts';
import { type PersonEntity } from '../entities/entity.person.ts';
import type Game from '../Game.ts';
import { TileI } from '../types.ts';
import { Task } from './task.ts';

let infinitelyIncreasingIndex = 0;

export class PatrolTask extends Task<[Game, PersonEntity]> {
	private waypoints: TileI[] = [];

	public constructor(options: { waypoints?: TileI[]; repeating: boolean }) {
		super(async (game, entity) => {
			const waypoints = options.waypoints || this.#pickRandomRoute(game, entity);
			this.waypoints = waypoints;

			console.log('Perform patrol task please');
			for (let i = 0; i <= waypoints.length; i++) {
				console.log(`WAYPOINT ${i}/${waypoints.length} @ ${game.time.now}`);
				const next = waypoints[i % waypoints.length];

				await game.time.wait(3000);
				console.log('Time is now ' + game.time.now);
				await entity.walkToTile(next);
				if (i === waypoints.length) {
					if (options.repeating) {
						i = -1;
					} else {
						break;
					}
				}
			}
		});
	}

	#pickRandomRoute(game: Game, entity: PersonEntity) {
		const start = game.terrain.getTileClosestToXy(
			entity.$$location.get().x,
			entity.$$location.get().y,
		);
		const island = game.terrain
			.getIslands((t) => t.isLand())
			.find((island) => island.includes(start))
			?.filter((tile) => tile !== start);
		if (!start || !island) {
			// Expect to never throw this:
			throw new Error('Got falsy start from none of the islands');
		}

		const waypoints = [];
		for (
			let i = 0;
			i < Random.between(3, 6, entity.id, 'job', 'waypoint_amount', ++infinitelyIncreasingIndex) &&
			island.length;
			i++
		) {
			const tile = Random.fromArray(
				island,
				entity.id,
				'job',
				'waypoint',
				i,
				++infinitelyIncreasingIndex,
			);
			island.splice(island.indexOf(tile), 1);
			waypoints.push(tile);
		}
		waypoints.push(start);
		return waypoints;
	}

	get label() {
		return `Patrolling between ${this.waypoints.length} waypoints`;
	}
}
