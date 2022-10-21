import { type PersonEntity } from '../entities/entity.person.ts';
import { type TileI } from '../types.ts';
import { Job } from './Job.ts';
import { type JobI } from './types.ts';

/**
 * The patrol job makes the entity travel between the same set of tiles time and time again.
 * When the entity reaches the last tile on its checklist, it starts at the top of that list again.
 */
export class PatrolJob extends Job<PersonEntity> implements JobI {
	private readonly waypoints: TileI[];

	private waypointIndex: number;

	constructor(entity: PersonEntity, waypoints: TileI[]) {
		super();
		if (waypoints.length < 2) {
			throw new Error('A patrol must have at least 2 waypoints');
		}
		this.waypoints = waypoints;
		this.waypointIndex = 0;

		this.$attach.on((game) => {
			const repeatPathDestroyer = entity.$pathEnd.on(() => {
				// Guards move from one waypoint to another, pausing for a random amount of time in between
				// @TODO randomize pause time
				// @TODO probably do something with _destroy
				const _destroy = game.time.setTimeout(() => {
					this.waypointIndex += 1;
					// @TODO maybe reverse path, rather than starting again at step 1
					const next = this.waypoints[this.waypointIndex % this.waypoints.length];
					entity.walkToTile(next);
				}, 3000);
			});
			this.$detach.once(repeatPathDestroyer);
			entity.walkToTile(this.waypoints[0]);
		});
	}

	get label() {
		return `Patrolling between ${this.waypoints.length} waypoints`;
	}
}
