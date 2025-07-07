import Game from '../level-1/Game';
import { generateGridTerrainFromAscii } from './generateGridTerrainFromAscii';
import { TestDriver } from './TestDriver';

const defaultEmptyGameMap = `
	XXXXX
	XXXXX
	XXXXX
	XXXXX
	XXXXX
`;

type EmptyGameUtils = {
	game: Game;
	initGame: () => Promise<void>;
	// tileClosestToMiddle: EcsArchetypeEntity<typeof tileArchetype>;
};

/**
 * Returns a reference to the game, and some utilities maybe.
 */
export function generateEmptyGame(ascii: string = defaultEmptyGameMap): EmptyGameUtils {
	const game = new Game(new TestDriver(), '1');

	async function initGame() {
		await game.entities.add(...generateGridTerrainFromAscii(ascii));
	}

	// const tileClosestToMiddle = game.terrain.getTileClosestToXy(3, 3);

	return { game, initGame };
}
