import { Game } from '../Game';
import { EntityPersonI, JobI, TileI } from '../types';
import { Job } from './Job';

export class PatrolJob extends Job implements JobI {
	private readonly destroyers: (() => void)[] = [];
	waypoints: TileI[];
	waypointIndex: number;

	constructor(entity: EntityPersonI, waypoints: TileI[]) {
		super(entity);
		if (waypoints.length < 2) {
			throw new Error('A patrol must have at least 2 waypoints');
		}
		this.waypoints = waypoints;
		this.waypointIndex = 0;
	}

	get label() {
		return `Patrolling between ${this.waypoints.length} waypoints`;
	}

	public start(game: Game) {
		super.start(game);
		this.destroyers.push(
			this.entity.$stoppedWalking.on(() => {
				// Guards move from one waypoint to another, pausing for a random amount of time in between
				const destroy = game.time.setTimeout(() => {
					this.waypointIndex += 1;
					const next = this.waypoints[this.waypointIndex % this.waypoints.length];
					this.entity.walkTo(next);
					this.destroyers.splice(this.destroyers.indexOf(destroy), 1);
				}, 3000);
				this.destroyers.push(destroy);
			})
		);

		this.entity.walkTo(this.waypoints[0]);
	}

	destroy() {
		super.destroy();
		this.destroyers.forEach(destroy => destroy());
	}
}
