import { EcsEntity, locationComponent, pathingComponent, type Game } from '@lib/core';

export async function walkEntityToEntity(
	game: Game,
	entity: EcsEntity<typeof pathingComponent>,
	destination: EcsEntity<typeof locationComponent>,
) {
	const tile = game.terrain.getTileEqualToLocation(destination.$$location.get());
	if (!tile) {
		throw new Error(`Entity "${destination.id}" lives on a detached coordinate`);
	}
	await entity.walkToTile(game, tile);
}

export function getEntitiesReachableByEntity<F>(
	game: Game,
	entity: EcsEntity<typeof locationComponent>,
): EcsEntity<typeof locationComponent>[] {
	const location = game.terrain.getTileEqualToLocation(entity.$$location.get());
	if (!location) {
		throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
	}
	const island = game.terrain.selectContiguousTiles(location);
	return game.entities
		.filter<EcsEntity<typeof locationComponent>>((entity) => locationComponent.test(entity))
		.filter((entity) => {
			const location = entity.$$location.get();
			return island.some((tile) => location.equals(tile.$$location.get()));
		});
}
