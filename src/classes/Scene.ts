import { Entity } from '../entities/Entity';
import { GuardEntity } from '../entities/GuardEntity';
import { PersonEntity } from '../entities/PersonEntity';
import { PatrolJob } from '../jobs/PatrolJob';
import { RoamJob } from './../jobs/RoamJob';
import { Terrain } from './Terrain';
function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}
export class Scene {
	public readonly terrain: Terrain;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: Entity[];

	constructor(terrain: Terrain, entities: Entity[]) {
		this.terrain = terrain;
		this.entities = entities;
	}

	play() {
		const destroyers = this.entities.map((entity) => entity.play());
		return () => destroyers.forEach((d) => d());
	}

	static generateRandom(size: number) {
		const terrain = Terrain.generateRandom(size);
		const walkableTiles = terrain.coordinates.filter((c) => c.canWalkHere());
		const islands = terrain.getIslands();
		const entities = [
			...repeat(2, (i) => {
				const start = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
				const island = islands.find((island) => island.includes(start));
				if (!island) {
					throw new Error();
				}
				const guard = new GuardEntity('guard-' + i, start);
				guard.doJob(
					new PatrolJob(
						guard,
						Array.from(new Array(2 + Math.floor(Math.random() * 4))).map(
							() => island[Math.floor(Math.random() * island.length)]
						)
					)
				);
				return guard;
			}),
			...repeat(10, (i) => {
				const start = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
				const worker = new PersonEntity('person-' + i, start);
				worker.doJob(new RoamJob(worker));
				return worker;
			})
		];

		return new Scene(terrain, entities);
	}
}
