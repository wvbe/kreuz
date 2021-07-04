import { CivilianEntity } from '../entities/CivilianEntity';
import { GuardEntity } from '../entities/GuardEntity';
import { PersonEntity } from '../entities/PersonEntity';
import { LoiterJob } from '../jobs/LoiterJob';
import { PatrolJob } from '../jobs/PatrolJob';
import { GenericTerrain, GenericTile } from '../terrain/GenericTerrain';
import { Random } from '../util/Random';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}

export const RATIO_WATER_OF_TOTAL = 0.25;

export function generateTerrain(seed: string, size: number) {}

function generatePatrolJob(seed: string, entity: PersonEntity) {
	const start = entity.location;
	const island = start.terrain?.getIslands().find(island => island.includes(start));
	if (!island) {
		// Expect to never throw this:
		throw new Error('Got falsy start from none of the islands');
	}

	return new PatrolJob(entity, [
		...repeat(2 + Math.floor(Random.float(entity.id, 'job', 'waypoint_amount') * 4), i =>
			Random.arrayItem(island, entity.id, 'job', 'waypoint', i)
		),
		start
	]);
}

export function generateEntities<Y extends GenericTile, T extends GenericTerrain<Y>>(
	seed: string,
	terrain: T
) {
	const walkableTiles = terrain.tiles.filter(c => c.isLand());

	// const islands = terrain.getIslands();

	const amountOfGuards = 5;
	const amountOfCivilians = 10;
	return [
		...repeat(amountOfGuards, i => {
			const id = seed + '-guard-' + i;
			const start = Random.arrayItem(walkableTiles, id, 'start');
			const guard = new GuardEntity(id, start);
			const job = generatePatrolJob(seed, guard);
			guard.doJob(job);
			return guard;
		}),
		...repeat(amountOfCivilians, i => {
			const id = seed + '-person-' + i;
			const start = Random.arrayItem(walkableTiles, id, 'start');
			const worker = new CivilianEntity(id, start);
			worker.doJob(new LoiterJob(worker));
			return worker;
		})
	];
}
