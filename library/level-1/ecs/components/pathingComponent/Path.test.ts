import { expect, it, describe, run, generateGridTerrainFromAscii } from '@test';
import { Path } from './Path.ts';

describe('Path', () => {
	it('.find()', () => {
		// Where "x" is walkable, top-left is start and top-right is end.
		const terrain = generateGridTerrainFromAscii(`
			X-X
			X-X
			XXX
		`);

		expect(new Path({ closest: false }).findPathBetween(terrain[0], terrain[2])).toEqual([
			terrain[3],
			terrain[6],
			terrain[7],
			terrain[8],
			terrain[5],
			terrain[2],
		]);
	});
});

run();
