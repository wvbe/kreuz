import { Terrain } from '../terrain/Terrain';
import { Path } from './Path';

describe('Path', () => {
	it('#find()', () => {
		// Where "x" is walkable, top-left is start and top-right is end.
		const terrain = Terrain.fromAscii(`
			X-X
			X-X
			XXX
		`);

		expect(
			new Path(terrain, { closest: false }).find(terrain.tiles[0], terrain.tiles[2])
		).toEqual([
			terrain.tiles[3],
			terrain.tiles[6],
			terrain.tiles[7],
			terrain.tiles[8],
			terrain.tiles[5],
			terrain.tiles[2]
		]);
	});
});
