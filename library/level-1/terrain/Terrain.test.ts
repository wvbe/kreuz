import { expect } from '@test';
import { generateGridTerrainFromAscii } from '../../test/generateGridTerrainFromAscii.ts';
import { Terrain } from './Terrain.ts';

Deno.test('Terrain', async (test) => {
	// it('Save/load round-robins to an equal object', () => {
	// 	const terrain = generateGridTerrainFromAscii(
	// 		`
	// 			XXX-
	// 			XX-X
	// 			--XX
	// 			XXXX
	// 		`,
	// 	);
	// 	expect(terrain).toEqual(Terrain.fromSaveJson(terrain.toSaveJson()));
	// });
	await test.step('.getIslands()', async (test) => {
		await test.step('Finds the correct amount of islands', () => {
			const islands = new Terrain(
				generateGridTerrainFromAscii(
					`
						XXX-
						XX-X
						--XX
						XXXX
					`,
				),
			).getIslands();
			expect(islands).toHaveLength(2);
			expect(islands[0]).toHaveLength(5);
			expect(islands[1]).toHaveLength(7);
		});
		await test.step('Returns empty array when nothing selects', () => {
			const islands = new Terrain(
				generateGridTerrainFromAscii(
					`
						---
						---
						---
					`,
				),
			).getIslands();
			expect(islands).toHaveLength(0);
		});
	});
});
