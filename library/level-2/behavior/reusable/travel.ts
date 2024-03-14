import { EcsEntity, locationComponent, pathingComponent, type Game } from '@lib/core';

export async function walkEntityToEntity(
	game: Game,
	entity: EcsEntity<typeof pathingComponent>,
	destination: EcsEntity<typeof locationComponent>,
) {
	const tile = game.terrain.getTileEqualToLocation(destination.$$location.get());
	await entity.walkToTile(tile);
}

export function getEntitiesReachableByEntity<F>(
	game: Game,
	entity: EcsEntity<typeof locationComponent>,
): EcsEntity<typeof locationComponent>[] {
	const location = game.terrain.getTileEqualToLocation(entity.$$location.get());
	const island = game.terrain.selectContiguousTiles(location);
	return game.entities
		.filter<EcsEntity<typeof locationComponent>>(locationComponent.test)
		.filter((entity) => {
			const location = entity.$$location.get();
			return island.some((tile) => location.equals(tile));
		});
}
