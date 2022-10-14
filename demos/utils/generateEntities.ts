import {
	Random,
	PersonEntity,
	SettlementEntity,
	type EntityPersonI,
	// @TODO refactor job generator out of this function;
	LoiterJob,
	PatrolJob,
	type SeedI,
	type TerrainI,
} from '@lib';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}

function generatePatrolJob(terrain: TerrainI, seed: SeedI, entity: EntityPersonI) {
	const start = terrain.getTileClosestToXy(entity.$$location.get().x, entity.$$location.get().y);
	const island = terrain.getIslands((t) => t.isLand()).find((island) => island.includes(start));
	if (!start || !island) {
		// Expect to never throw this:
		throw new Error('Got falsy start from none of the islands');
	}

	return new PatrolJob(entity, [
		...repeat(2 + Math.floor(Random.float(entity.id, 'job', 'waypoint_amount') * 4), (i) =>
			Random.fromArray(island, entity.id, 'job', 'waypoint', i),
		),
		start,
	]);
}

export function generateEntities(seed: SeedI, populationSize: number, terrain: TerrainI) {
	const walkableTiles = terrain.tiles.filter((c) => c.isLand());
	if (!walkableTiles.length) {
		throw new Error('The terrain does not contain any walkable tiles!');
	}
	return [
		...repeat(Math.round(Random.between(2, 6, seed, 'guardamount')), (i) => {
			const id = `${seed}-guard-${i}`;
			const entity = new PersonEntity(id, Random.fromArray(walkableTiles, id, 'start'));
			entity.doJob(generatePatrolJob(terrain, seed, entity));
			return entity;
		}),
		...repeat(Math.round(Random.between(5, 14, seed, 'civvyamount')), (i) => {
			const id = `${seed}-civvy-${i}`;
			const entity = new PersonEntity(id, Random.fromArray(walkableTiles, id, 'start'));
			entity.doJob(new LoiterJob(entity));
			return entity;
		}),
		...repeat(Math.round(Random.between(10, 14, seed, 'settlements')), (i) => {
			const id = `${seed}-settlement-${i}`;
			const building = new SettlementEntity(id, Random.fromArray(walkableTiles, id, 'start'), {
				areaSize: Random.between(0.3, 0.6, seed, 'setsize', i),
				minimumBuildingLength: 0.2,
				scale: 0.5,
			});
			return building;
		}),
	];
}
