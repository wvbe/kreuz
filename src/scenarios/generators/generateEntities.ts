import { CivilianEntity } from '../../entities/CivilianPersonEntity';
import { GuardEntity } from '../../entities/GuardPersonEntity';
import { LoiterJob } from '../../jobs/LoiterJob';
import { PatrolJob } from '../../jobs/PatrolJob';
import { EntityPersonI, SeedI, TerrainI } from '../../types';
import { Random } from '../../classes/Random';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}

export const RATIO_WATER_OF_TOTAL = 0.25;

export function generateTerrain(seed: string, size: number) {}

function generatePatrolJob(seed: SeedI, entity: EntityPersonI) {
	const start = entity.location;
	const island = start?.terrain
		?.getIslands(t => t.isLand())
		.find(island => island.includes(start));
	if (!start || !island) {
		// Expect to never throw this:
		throw new Error('Got falsy start from none of the islands');
	}

	return new PatrolJob(entity, [
		...repeat(2 + Math.floor(Random.float(entity.id, 'job', 'waypoint_amount') * 4), i =>
			Random.fromArray(island, entity.id, 'job', 'waypoint', i)
		),
		start
	]);
}

export function generateEntities<T extends TerrainI>(seed: SeedI, terrain: T) {
	const walkableTiles = terrain.tiles.filter(c => c.isLand());
	if (!walkableTiles.length) {
		throw new Error('The terrain does not contain any walkable tiles!');
	}
	const amountOfGuards = 5;
	const amountOfCivilians = 10;
	return [
		...repeat(amountOfGuards, i => {
			const id = `${seed}-guard-${i}`;
			const start = Random.fromArray(walkableTiles, id, 'start');
			const guard = new GuardEntity(id, start);
			const job = generatePatrolJob(seed, guard);
			guard.doJob(job);
			return guard;
		}),
		...repeat(amountOfCivilians, i => {
			const id = `${seed}-person-${i}`;
			const start = Random.fromArray(walkableTiles, id, 'start');
			const worker = new CivilianEntity(id, start);
			worker.doJob(new LoiterJob(worker));
			return worker;
		})
	];
}
