import { EntityI, TerrainI } from '../types';
import Logger from './Logger';

export class Scene {
	public readonly terrain: TerrainI;

	// @TODO change to not readonly, and handle spontaneous changes
	public readonly entities: EntityI[];

	public readonly seed;

	constructor(seed: string, terrain: TerrainI, entities: EntityI[]) {
		this.seed = seed;
		this.terrain = terrain;
		this.entities = entities;
	}

	play() {
		this.entities.forEach(entity => entity.play());
		return () => {
			this.destroy();
		};
	}

	destroy() {
		Logger.group(`Destroy ${this.constructor.name}`);
		this.entities.forEach(entity => entity.destroy());
		Logger.groupEnd();
	}
}
