import { DEFAULT_ASSETS, Game } from '@lib';

import { generateGridTerrainFromAscii } from './generateGridTerrainFromAscii.ts';
import { TestDriver } from './TestDriver.ts';

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
