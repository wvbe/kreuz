import { expect } from '@jest/globals';
import { generateGridTerrainFromAscii } from '../../test/generateGridTerrainFromAscii';
import { Terrain } from './Terrain';

describe('Terrain', () => {
	describe('.getIslands()', () => {
		it('Finds the correct amount of islands', () => {
			const islands = new Terrain({
				tiles: generateGridTerrainFromAscii(
					`
						XXX-
						XX-X
						--XX
						XXXX
					`,
				),
			}).getIslands();
			expect(islands).toHaveLength(2);
			expect(islands[1]).toHaveLength(7);
			expect(islands[0]).toHaveLength(5);
		});
		it('Returns empty array when nothing selects', () => {
			const islands = new Terrain({
				tiles: generateGridTerrainFromAscii(
					`
						---
						---
						---
					`,
				),
			}).getIslands();
			expect(islands).toHaveLength(0);
		});
	});
});
