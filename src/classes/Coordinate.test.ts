import { Path } from './Path';
import { Terrain } from './Terrain';
import { TerrainCoordinate } from './TerrainCoordinate';

describe('Coordinate.ts', () => {
	it('getNeighbors', () => {
		const terrain = Terrain.generateRandom(4);
		expect(terrain.getNeighbors(terrain.getAtXy(0, 0) as TerrainCoordinate)).toHaveLength(2);
		expect(terrain.getNeighbors(terrain.getAtXy(3, 3) as TerrainCoordinate)).toHaveLength(2);
		expect(terrain.getNeighbors(terrain.getAtXy(0, 1) as TerrainCoordinate)).toHaveLength(3);
		expect(terrain.getNeighbors(terrain.getAtXy(1, 1) as TerrainCoordinate)).toHaveLength(4);
	});
	it('pathfinding', () => {
		// Traversable (Y) and non-traversable (N) coordinates:
		//   YNY
		//   YNY
		//   YYY
		const terrain = new Terrain(
			[
				new TerrainCoordinate(0, 0, 1),
				new TerrainCoordinate(1, 0, 0),
				new TerrainCoordinate(2, 0, 1),
				new TerrainCoordinate(0, 1, 1),
				new TerrainCoordinate(1, 1, 0),
				new TerrainCoordinate(2, 1, 1),
				new TerrainCoordinate(0, 2, 1),
				new TerrainCoordinate(1, 2, 1),
				new TerrainCoordinate(2, 2, 1)
			],
			{ waterlineZ: 0 }
		);
		expect(
			new Path(terrain, { closest: false }).find(
				terrain.getAtXy(0, 0) as TerrainCoordinate,
				terrain.getAtXy(2, 0) as TerrainCoordinate
			)
		).toHaveLength(6);
	});
});
