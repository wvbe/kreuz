import { locationComponent } from '../../../core/ecs/components/locationComponent';
import { pathingComponent } from '../../../core/ecs/components/pathingComponent';
import { type EcsEntity } from '../../../core/ecs/types';
import type Game from '../../../core/Game';

export async function walkEntityToEntity(
	game: Game,
	entity: EcsEntity<typeof pathingComponent>,
	destination: EcsEntity<typeof locationComponent>,
) {
	const tile = game.terrain.getTileAtMapLocation(destination.location.get());
	if (!tile) {
		throw new Error(`Entity "${destination.id}" lives on a detached coordinate`);
	}
	await entity.walkToTile(game, tile);
}

export function getEntitiesReachableByEntity<F>(
	game: Game,
	entity: EcsEntity<typeof locationComponent>,
): EcsEntity<typeof locationComponent>[] {
	const location = game.terrain.getTileAtMapLocation(entity.location.get());
	if (!location) {
		throw new Error(`Entity "${entity.id}" lives on a detached coordinate`);
	}
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
