import { generateGridTerrainFromAscii } from '../../../../test/generateGridTerrainFromAscii';
import { Terrain } from '../../../terrain/Terrain';
import { getIslandHopsBetweenCoordinates } from './getIslandHopsBetweenCoordinates';

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
		const path = getIslandHopsBetweenCoordinates(
			[buildingOne, 0, 0, 0],
			[buildingTwo, 2, 0, 0],
		);

		// This comparison stalls Jest out:
		// expect(path[0].tiles[0].location.get()[0]).toBe(world);
		// expect(path[0].tiles[1].location.get()[0]).toBe(buildingTwo);

		// So instead
		expect(path.map((p) => p.tiles[0].location.get()[0].toString())).toEqual([
			'building-1',
			'world',
			'building-2',
		]);
	});
});
