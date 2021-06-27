import { TerrainCoordinate } from './../classes/TerrainCoordinate';
import { PersonEntity } from '../entities/PersonEntity';
import { Job } from './Job';
import { Random } from '../util/Random';

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
		let steps = 0;
		const doTimeout = () =>
			setTimeout(() => {
				steps++;
				this.entity.walkTo(
					Random.arrayItem(this.island, this.entity.id, 'roam-destination', steps)
				);
			}, 5000 + Random.float(this.entity.id, 'roam-delay', steps) * 10000);

		const destroyers = [this.entity.pathEnd.on(doTimeout)];
		doTimeout();

		return () => destroyers.forEach(d => d());
	}
}
