import { expect, it, describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { generateGridTerrainFromAscii } from '../generators/generateGridTerrainFromAscii.ts';

describe('Terrain', () => {
	describe('#getIslands', () => {
		it('Finds the correct amount of islands', () => {
			const islands = generateGridTerrainFromAscii(
				`
					XXX-
					XX-X
					--XX
					XXXX
				`,
			).getIslands();
			expect(islands).toHaveLength(2);
			expect(islands[0]).toHaveLength(5);
			expect(islands[1]).toHaveLength(7);
		});
		it('Returns empty array when nothing selects', () => {
			const islands = generateGridTerrainFromAscii(
				`
					---
					---
					---
				`,
			).getIslands();
			expect(islands).toHaveLength(0);
		});
	});
});

run();
