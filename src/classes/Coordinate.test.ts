import { Path } from './Path';
import { GenericTile, GenericTerrain } from '../terrain/GenericTerrain';

describe('Coordinate.ts', () => {
	it('getNeighbors', () => {
		// const terrain = GenericTerrain.generateRandom('test', 4);
		// expect(terrain.getNeighborTiles(terrain.getClosestToXy(0, 0) as GenericTile)).toHaveLength(2);
		// expect(terrain.getNeighborTiles(terrain.getClosestToXy(3, 3) as GenericTile)).toHaveLength(2);
		// expect(terrain.getNeighborTiles(terrain.getClosestToXy(0, 1) as GenericTile)).toHaveLength(3);
		// expect(terrain.getNeighborTiles(terrain.getClosestToXy(1, 1) as GenericTile)).toHaveLength(4);
	});
	it('pathfinding', () => {
		// Traversable (Y) and non-traversable (N) coordinates:
		//   YNY
		//   YNY
		//   YYY
		const terrain = new GenericTerrain(
			[
				new GenericTile(0, 0, 1),
				new GenericTile(1, 0, 0),
				new GenericTile(2, 0, 1),
				new GenericTile(0, 1, 1),
				new GenericTile(1, 1, 0),
				new GenericTile(2, 1, 1),
				new GenericTile(0, 2, 1),
				new GenericTile(1, 2, 1),
				new GenericTile(2, 2, 1)
			],
			{ waterlineZ: 0 }
		);
		expect(
			new Path(terrain, { closest: false }).find(
				terrain.getClosestToXy(0, 0) as GenericTile,
				terrain.getClosestToXy(2, 0) as GenericTile
			)
		).toHaveLength(6);
	});
});
