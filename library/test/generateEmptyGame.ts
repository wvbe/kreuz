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

export function generateEmptyGame(ascii: string = defaultEmptyGameMap) {
	return new Game(new TestDriver(), '1', generateGridTerrainFromAscii(ascii), DEFAULT_ASSETS);
}
