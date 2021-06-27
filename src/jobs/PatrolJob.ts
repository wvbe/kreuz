import { TerrainCoordinate } from '../classes/TerrainCoordinate';
import { PersonEntity } from '../entities/PersonEntity';
import { Job } from './Job';

export class PatrolJob extends Job<PersonEntity> {
	waypoints: TerrainCoordinate[];
	waypointIndex: number;

	constructor(entity: PersonEntity, waypoints: TerrainCoordinate[]) {
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

	start() {
		const destroyers = [
			this.entity.pathEnd.on(() => {
				// Guards move from one waypoint to another, pausing for a random amount of time in between
				setTimeout(() => {
					this.waypointIndex += 1;
					const next = this.waypoints[this.waypointIndex % this.waypoints.length];
					this.entity.walkTo(next);
				}, 3000);
			})
		];

		this.entity.walkTo(this.waypoints[0]);

		return () => {
			destroyers.forEach(d => d());
		};
	}
}
