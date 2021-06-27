import { Entity } from '../entities/Entity';
import { generateEntities as generateHelloWorldEntities } from '../generators/hello-world';
import { Terrain } from './Terrain';

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
		const entities = generateHelloWorldEntities(seed, terrain);
		return new Scene(seed, terrain, entities);
	}
}
