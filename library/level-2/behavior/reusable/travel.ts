import Game from '../../../level-1/Game.ts';
import { EventedPromise } from '../../../level-1/classes/EventedPromise.ts';
import { PersonEntity } from '../../../level-1/entities/entity.person.ts';
import { EntityI } from '../../../level-1/entities/types.ts';

export function walkEntityToEntity(
	game: Game,
	entity: PersonEntity,
	destination: EntityI,
): EventedPromise {
	const tile = game.terrain.getTileEqualToLocation(destination.$$location.get());
	return entity.walkToTile(tile);
}

export function getEntitiesReachableByEntity<F>(game: Game, entity: PersonEntity): EntityI[] {
	const location = game.terrain.getTileEqualToLocation(entity.$$location.get());
	const island = game.terrain.selectContiguousTiles(location);
	return game.entities.filter((e) => island.some((tile) => e.$$location.get().equals(tile)));
}
