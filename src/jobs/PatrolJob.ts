import { PersonEntity } from '../entities/PersonEntity';
import { TerrainCoordinate } from '../classes/TerrainCoordinate';
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
				this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
				setTimeout(
					() => this.entity.walkTo(this.waypoints[this.waypointIndex]),
					3000 + Math.random()
				);
			})
		];

		this.entity.walkTo(this.waypoints[0]);
		return () => destroyers.forEach((d) => d());
	}
}
