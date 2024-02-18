import Game from '../../level-1/Game.ts';
import { PersonEntity } from '../../level-1/entities/entity.person.ts';

export type EntityBlackboard = {
	entity: PersonEntity;
	game: Game;
};
