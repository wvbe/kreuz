import { getTileAtLocation } from '../../../core/ecs/components/location/getTileAtLocation';
import { locationComponent } from '../../../core/ecs/components/locationComponent';
import { pathingComponent } from '../../../core/ecs/components/pathingComponent';
import { type EcsEntity } from '../../../core/ecs/types';
import type Game from '../../../core/Game';

export async function walkEntityToEntity(
	game: Game,
	entity: EcsEntity<typeof pathingComponent>,
	destination: EcsEntity<typeof locationComponent>,
) {
	const tile = getTileAtLocation(destination.location.get());
	await entity.walkToTile(game, tile);
}

export function getEntitiesReachableByEntity<F>(
	game: Game,
	entity: EcsEntity<typeof locationComponent>,
): EcsEntity<typeof locationComponent>[] {
	const location = getTileAtLocation(entity.location.get());
	const island = game.terrain.selectContiguousTiles(location);
	return game.entities
		.filter<EcsEntity<typeof locationComponent>>((entity) => locationComponent.test(entity))
		.filter((entity) => {
			const location = entity.location.get();
			return island.some((tile) => {
				const tileLocation = tile.location.get();
				return (
					location[0] === tileLocation[0] &&
					location[1] === tileLocation[1] &&
					location[2] === tileLocation[2]
				);
			});
		});
}
