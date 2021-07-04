import { Entity } from '../entities/Entity';
import { generateEntities as generateHelloWorldEntities } from '../generators/hello-world';
import { DualMeshTerrain, DualMeshTile, generateRandom } from '../terrain/DualMeshTerrain';
import { GenericTerrain, GenericTile } from '../terrain/GenericTerrain';

export class Scene<T extends GenericTerrain<GenericTile>> {
	public readonly terrain: T;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: Entity[];

	public readonly seed;

	constructor(seed: string, terrain: T, entities: Entity[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
	}

	play() {
		const destroyers = this.entities.map(entity => entity.play());
		return () => destroyers.forEach(d => d());
	}

	static generateRandom(seed: string, size: number) {
		const terrain = generateRandom(seed, size);
		const entities = generateHelloWorldEntities<DualMeshTile, DualMeshTerrain>(seed, terrain);
		return new Scene(seed, terrain, entities);
	}
}
