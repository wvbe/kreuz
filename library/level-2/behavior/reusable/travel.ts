import { type EntityI, type Game, type PersonEntity } from '../../../level-1/mod.ts';

export async function walkEntityToEntity(game: Game, entity: PersonEntity, destination: EntityI) {
	const tile = game.terrain.getTileEqualToLocation(destination.$$location.get());
	await entity.walkToTile(tile);
}

export function getEntitiesReachableByEntity<F>(game: Game, entity: PersonEntity): EntityI[] {
	const location = game.terrain.getTileEqualToLocation(entity.$$location.get());
	const island = game.terrain.selectContiguousTiles(location);
	return game.entities.filter((e) => island.some((tile) => e.$$location.get().equals(tile)));
}
