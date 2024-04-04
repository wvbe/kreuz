import Game from '../../Game.ts';

type EcsSystemAttachor = (game: Game) => void | Promise<void>;

export class EcsSystem {
	public readonly attachGame: EcsSystemAttachor;

	constructor(onGameAttach: EcsSystemAttachor) {
		this.attachGame = onGameAttach;
	}
}
