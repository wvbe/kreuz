import { GenericTerrain } from '../terrain/GenericTerrain';
import { GenericTile } from '../terrain/GenericTile';
import { Path } from './Path';

describe('Path', () => {
	it('#find()', () => {
		// Terrain:
		//
		//   x-x
		//   x-x
		//   xxx
		//
		// Where "x" is walkable, top-left is start and top-right is end.
		const tiles = [
			new GenericTile(0, 0, 1),
			new GenericTile(1, 0, 0),
			new GenericTile(2, 0, 1),
			new GenericTile(0, 1, 1),
			new GenericTile(1, 1, 0),
			new GenericTile(2, 1, 1),
			new GenericTile(0, 2, 1),
			new GenericTile(1, 2, 1),
			new GenericTile(2, 2, 1)
		];
		expect(
			new Path(new GenericTerrain(tiles), { closest: false }).find(tiles[0], tiles[2])
		).toEqual([tiles[3], tiles[6], tiles[7], tiles[8], tiles[5], tiles[2]]);
	});
});
