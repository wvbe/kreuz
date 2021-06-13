import { Entity } from '../entities/Entity';
import { GuardEntity } from '../entities/GuardEntity';
import { PersonEntity } from '../entities/PersonEntity';
import { PatrolJob } from '../jobs/PatrolJob';
import { Random } from './Random';
import { RoamJob } from './../jobs/RoamJob';
import { Terrain } from './Terrain';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}
export class Scene {
	public readonly terrain: Terrain;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: Entity[];

	public readonly seed;

	constructor(seed: string, terrain: Terrain, entities: Entity[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
	}

	play() {
		const destroyers = this.entities.map(entity => entity.play());
		return () => destroyers.forEach(d => d());
	}

	static generateRandom(seed: string, size: number) {
		const terrain = Terrain.generateRandom(seed, size);
		const walkableTiles = terrain.coordinates.filter(c => c.canWalkHere());
		const islands = terrain.getIslands();
		const entities = [
			...repeat(2, i => {
				const id = seed + '-guard-' + i;
				const start = Random.arrayItem(walkableTiles, id, 'start');
				const island = islands.find(island => island.includes(start));
				if (!island) {
					throw new Error();
				}
				const guard = new GuardEntity(id, start);
				guard.doJob(
					new PatrolJob(
						guard,
						Array.from(
							new Array(
								2 + Math.floor(Random.float(id, 'job', 'waypoint_amount') * 4)
							)
						).map((_, i) => Random.arrayItem(island, id, 'job', 'waypoint', i))
					)
				);
				return guard;
			}),
			...repeat(10, i => {
				const id = seed + '-person-' + i;
				const start = Random.arrayItem(walkableTiles, id, 'start');
				const worker = new PersonEntity(id, start);
				worker.doJob(new RoamJob(worker));
				return worker;
			})
		];

		return new Scene(seed, terrain, entities);
	}
}
