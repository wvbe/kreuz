import { type Game, type PersonEntity } from '../../level-1/mod.ts';

export type EntityBlackboard = {
	entity: PersonEntity;
	game: Game;
};
