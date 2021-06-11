import { Entity } from '../entities/Entity';
import { GuardEntity } from '../entities/GuardEntity';
import { PatrolJob } from '../jobs/Patrol';
import { Terrain } from './Terrain';

export class Scene {
	public readonly terrain: Terrain;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: Entity[];

	constructor(terrain: Terrain, entities: Entity[]) {
		this.terrain = terrain;
		this.entities = entities;
	}

	play() {
		const destroyers = this.entities.map(entity => entity.play());
		return () => destroyers.forEach(d => d());
	}

	static generateRandom(size: number) {
		const terrain = Terrain.generateRandom(size);
		const walkableTiles = terrain.coordinates.filter(c => c.canWalkHere());
		const islands = terrain.getIslands();
		const entities = Array.from(new Array(10)).map((_, i) => {
			const start = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
			const island = islands.find(island => island.includes(start));
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
		});

		return new Scene(terrain, entities);
	}
}
