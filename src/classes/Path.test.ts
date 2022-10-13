import { expect, it, describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { generateGridTerrainFromAscii } from '../generators/generateGridTerrainFromAscii.ts';
import { Path } from './Path.ts';

describe('Path', () => {
	it('.find()', () => {
		// Where "x" is walkable, top-left is start and top-right is end.
		const terrain = generateGridTerrainFromAscii(`
			X-X
			X-X
			XXX
		`);

		expect(new Path(terrain, { closest: false }).find(terrain.tiles[0], terrain.tiles[2])).toEqual([
			terrain.tiles[3],
			terrain.tiles[6],
			terrain.tiles[7],
			terrain.tiles[8],
			terrain.tiles[5],
			terrain.tiles[2],
		]);
	});
});

run();
