import { generateGridTerrainFromAscii } from '../../../../test/generateGridTerrainFromAscii';
import { Terrain } from '../../../terrain/Terrain';
import { calculatePathAcrossIslands } from './calculatePathAcrossIslands';

describe('getContiguousObjects', () => {
	const world = new Terrain({
		id: 'world',
		tiles: generateGridTerrainFromAscii(`
			XXX-X
			----X
			XXXXX
		`),
	});
	const buildingOne = new Terrain({
		id: 'building-1',
		tiles: generateGridTerrainFromAscii(`
			X-X
			X-X
			XXX
		`),
		parentage: {
			portalStart: [4, 0, 0],
			parentTerrain: world,
			portalEnd: [2, 0, 0],
		},
	});
	const buildingTwo = new Terrain({
		id: 'building-2',
		tiles: generateGridTerrainFromAscii(`
			XXX
			X--
			X-X
		`),
		parentage: {
			portalStart: [0, 2, 0],
			parentTerrain: world,
			portalEnd: [2, 0, 0],
		},
	});

	it('Out and in of a building', () => {
		const path = calculatePathAcrossIslands(
			buildingOne.getTileAtMapLocation([0, 0, 0]),
			buildingTwo.getTileAtMapLocation([2, 0, 0]),
		);
		expect(path).toHaveLength(1);
	});
});
