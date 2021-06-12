import { TerrainCoordinate } from './../classes/TerrainCoordinate';
import { PersonEntity } from '../entities/PersonEntity';
import { Job } from './Job';

export class RoamJob extends Job<PersonEntity> {
	island: TerrainCoordinate[];

	constructor(entity: PersonEntity) {
		super(entity);
		this.island = this.entity.location.terrain?.selectContiguousNeigbors(entity.location) || [];
	}

	get label() {
		return `Roaming the land`;
	}
	start() {
		if (!this.island.length) {
			return () => {};
		}
		const doTimeout = () =>
			setTimeout(
				() =>
					this.entity.walkTo(this.island[Math.floor(Math.random() * this.island.length)]),
				5000 + Math.random() * 10000
			);

		const destroyers = [this.entity.pathEnd.on(doTimeout)];
		doTimeout();

		return () => destroyers.forEach((d) => d());
	}
}
