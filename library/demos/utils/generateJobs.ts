import {
	Game,
	// @TODO refactor job generator out of this function;
	LoiterJob,
	PatrolJob,
	PersonEntity,
	Random, type SeedI,
	type TerrainI
} from '@lib';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}

function generatePatrolJob(terrain: TerrainI, seed: SeedI, entity: PersonEntity) {
	const start = terrain.getTileClosestToXy(entity.$$location.get().x, entity.$$location.get().y);
	const island = terrain.getIslands((t) => t.isLand()).find((island) => island.includes(start));
	if (!start || !island) {
		// Expect to never throw this:
		throw new Error('Got falsy start from none of the islands');
	}

	return new PatrolJob(entity, [
		...repeat(2 + Math.floor(Random.float(entity.id, 'job', 'waypoint_amount') * 4), (i) =>
			Random.fromArray(island, entity.id, 'job', 'waypoint', i),
		).filter((tile, i, all) => all.indexOf(tile) === i),
		start,
	]);
}

function generateLoiterJob(entity: PersonEntity) {
	return new LoiterJob(entity);
}

export function generateJobs(game: Game) {
	game.entities
		.filter<PersonEntity>((e) => e instanceof PersonEntity)
		.forEach((entity, i) => {
			const job = Random.boolean([game.seed, 'job-distribution', i], 0.2)
				? generatePatrolJob(game.terrain, game.seed, entity)
				: generateLoiterJob(entity);
			entity.doJob(job);
		});
}
