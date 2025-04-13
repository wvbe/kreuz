import Game from '../level-1/Game';
import { DEFAULT_ASSETS } from '../level-2/DEFAULT_ASSETS';
import { generateGridTerrainFromAscii } from './generateGridTerrainFromAscii';
import { TestDriver } from './TestDriver';

const defaultEmptyGameMap = `
	XXXXX
	XXXXX
	XXXXX
	XXXXX
	XXXXX
`;

export async function generateEmptyGame(ascii: string = defaultEmptyGameMap): Promise<Game> {
	const game = new Game(new TestDriver(), '1', DEFAULT_ASSETS);
	await game.entities.add(...generateGridTerrainFromAscii(ascii));
	return game;
}
