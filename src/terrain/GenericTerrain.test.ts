import { GenericTerrain } from './GenericTerrain';
import { GenericTile } from './GenericTile';

function map(strs: TemplateStringsArray) {
	const cleanString = strs[0]
		.trim()
		.replace(/\t/g, '')
		.split('\n')
		.map((line, y) =>
			line.split('').map((char, x) => {
				if (char === 'X') {
					return new GenericTile(x, y, 1);
				}
				if (char === '-') {
					return new GenericTile(x, y, -1);
				}
				throw new Error(`Unfamiliar mapping character "${char}"`);
			})
		);
	if (!cleanString.every(line => line.length === cleanString.length)) {
		throw new Error('Not a square map');
	}

	return new GenericTerrain(
		cleanString.reduce<GenericTile[]>((flat, line) => flat.concat(line), [])
	);
}

describe('Terrain', () => {
	describe('#getIslands', () => {
		it('Finds the correct amount of islands', () => {
			const islands = map`
					XXX-
					XX-X
					--XX
					XXXX
				`.getIslands();
			expect(islands).toHaveLength(2);
			expect(islands[0]).toHaveLength(5);
			expect(islands[1]).toHaveLength(7);
		});
		it('Returns empty array when nothing selects', () => {
			const islands = map`
					---
					---
					---
				`.getIslands();
			expect(islands).toHaveLength(0);
		});
	});
});
