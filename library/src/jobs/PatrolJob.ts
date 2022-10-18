import { EntityPersonI } from '../entities/types.ts';
import Game from '../Game.ts';
import { type JobI } from './types.ts';
import { Job } from './Job.ts';
import { DestroyerFn, TileI } from '../types.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';

export class PatrolJob extends Job<PersonEntity> implements JobI {
	private readonly destroyers: DestroyerFn[] = [];
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
			this.entity.$pathEnd.on(() => {
				// Guards move from one waypoint to another, pausing for a random amount of time in between
				console.log('⭐️ Set timeout');
				const destroy = game.time.setTimeout(() => {
					console.log('⭐️ Timeout expire');
					this.waypointIndex += 1;
					const next = this.waypoints[this.waypointIndex % this.waypoints.length];
					this.entity.walkToTile(next);
					this.destroyers.splice(this.destroyers.indexOf(destroy), 1);
				}, 3000);
				this.destroyers.push(destroy);
			}),
		);

		this.entity.walkToTile(this.waypoints[0]);
	}

	destroy() {
		super.destroy();
		this.destroyers.forEach((destroy) => destroy());
	}
}
