import { CivilianEntity } from '../entities/CivilianEntity';
import { Terrain } from '../classes/Terrain';
import { TerrainCoordinate } from '../classes/TerrainCoordinate';
import { OUT_OF_BOUNDS, TerrainGenerator } from '../classes/TerrainGenerator';

import { GuardEntity } from '../entities/GuardEntity';
import { PersonEntity } from '../entities/PersonEntity';
import { PatrolJob } from '../jobs/PatrolJob';
import { Random } from '../util/Random';
import { RoamJob } from '../jobs/RoamJob';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}

const RATIO_WATER_OF_TOTAL = 0.25;

export function generateTerrain(seed: string, size: number) {
	const generator = new TerrainGenerator(seed, size);

	generator.generate(1);

	// For clarity, the terrain must currently always be square
	// @TODO fix that some time.
	const width = size,
		height = size;

	const coordinates = Array.from(new Array(width * height)).map<[number, number, number]>(
		(_, i) => {
			const x = i % width;
			const y = Math.floor(i / width);
			const z = generator.get(x, y);
			if (z === OUT_OF_BOUNDS) {
				throw new Error(`Out of bounds @ ${x}, ${y}`);
			}
			return [x, y, (2 * (z as number)) / size];
		}
	);

	const sortedHeights = coordinates.map(coordinate => coordinate[2]).sort();
	const waterlineOffset = sortedHeights[Math.floor(sortedHeights.length * RATIO_WATER_OF_TOTAL)];
	return new Terrain(
		coordinates.map(([x, y, z]) => new TerrainCoordinate(x, y, z - waterlineOffset))
	);
}

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

export function generateEntities(seed: string, terrain: Terrain) {
	const walkableTiles = terrain.coordinates.filter(c => c.isLand());
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
			worker.doJob(new RoamJob(worker));
			return worker;
		})
	];
}
