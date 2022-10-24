import {
	Game,
	// @TODO refactor job generator out of this function;
	LoiterJob,
	PatrolTask,
	PersonEntity,
	Random,
	SelfcareJob,
	type SeedI,
	type Terrain,
} from '@lib';

function repeat<P>(n: number, cb: (i: number) => P): P[] {
	return Array.from(new Array(n)).map((_, i) => cb(i));
}

function generatePatrolJob(terrain: Terrain, seed: SeedI, entity: PersonEntity) {
	const start = terrain.getTileClosestToXy(entity.$$location.get().x, entity.$$location.get().y);
	const island = terrain.getIslands((t) => t.isLand()).find((island) => island.includes(start));
	if (!start || !island) {
		// Expect to never throw this:
		throw new Error('Got falsy start from none of the islands');
	}

	return new PatrolTask({ repeating: true });
}

function generateLoiterJob(entity: PersonEntity) {
	return new LoiterJob(entity);
}

export function generateJobs(game: Game) {
	game.entities
		.filter<PersonEntity>((e) => e instanceof PersonEntity)
		.forEach((entity, i) => {
			const job = generatePatrolJob(game.terrain, game.seed, entity);
			entity.doJob(job);
		});
}
