import { expect } from '@jest/globals';
import { generateGridTerrainFromAscii } from '../../../../test/generateGridTerrainFromAscii';
import { Terrain } from '../../../terrain/Terrain';
import { Path } from './Path';

describe('Path', () => {
	it('.find()', () => {
		// Where "x" is walkable, top-left is start and top-right is end.
		const terrain = new Terrain({
			tiles: generateGridTerrainFromAscii(`
				X-X
				X-X
				XXX
			`),
		});

		expect(
			Path.forTile(terrain.getTileAtMapLocation([0, 0, 0]), {
				closest: false,
			}).to(terrain.getTileAtMapLocation([2, 0, 0])),
		).toHaveLength(6);
	});
});
