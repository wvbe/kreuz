import { Entity } from '../entities/Entity';
import { GenericTerrain, GenericTile } from '../terrain/GenericTerrain';

export class Scene<T extends GenericTerrain<GenericTile> = GenericTerrain<GenericTile>> {
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
		const destroyers = this.entities.map((entity) => entity.play());
		return () => destroyers.forEach((d) => d());
	}
}
