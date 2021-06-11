import { TerrainCoordinate } from '../classes/TerrainCoordinate';
import { Entity } from '../entities/Entity';

export class Job {
	entity: Entity;
	constructor(entity: Entity) {
		this.entity = entity;
	}

	get label(): string {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}

	start() {
		throw new Error(`Not implemented for ${this.constructor.name}`);
	}
}

export class PatrolJob extends Job {
	waypoints: TerrainCoordinate[];
	waypointIndex: number;

	constructor(entity: Entity, waypoints: TerrainCoordinate[]) {
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
					3000 + Math.random() * 5000
				);
			})
		];

		this.entity.walkTo(this.waypoints[0]);
		return () => destroyers.forEach(d => d());
	}
}
