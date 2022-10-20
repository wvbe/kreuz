import { PersonEntity } from '../entities/entity.person.ts';
import { DestroyerFn, TileI } from '../types.ts';
import { Job } from './Job.ts';
import { type JobI } from './types.ts';

export class PatrolJob extends Job<PersonEntity> implements JobI {
	private readonly destroyers: DestroyerFn[] = [];
	waypoints: TileI[];
	waypointIndex: number;

	constructor(entity: PersonEntity, waypoints: TileI[]) {
		super(entity);
		if (waypoints.length < 2) {
			throw new Error('A patrol must have at least 2 waypoints');
		}
		this.waypoints = waypoints;
		this.waypointIndex = 0;

		this.$attach.on((game) => {
			const repeatPathDestroyer = this.entity.$pathEnd.on(() => {
				// Guards move from one waypoint to another, pausing for a random amount of time in between
				// @TODO randomize pause time
				const destroy = game.time.setTimeout(() => {
					this.waypointIndex += 1;
					// @TODO maybe reverse path, rather than starting again at step 1
					const next = this.waypoints[this.waypointIndex % this.waypoints.length];
					this.entity.walkToTile(next);
					this.destroyers.splice(this.destroyers.indexOf(destroy), 1);
				}, 3000);
				this.destroyers.push(destroy);
			});
			this.$detach.once(repeatPathDestroyer);
			this.entity.walkToTile(this.waypoints[0]);
		});
	}

	get label() {
		return `Patrolling between ${this.waypoints.length} waypoints`;
	}
}
