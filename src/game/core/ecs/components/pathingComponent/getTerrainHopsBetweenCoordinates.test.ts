import { Terrain } from '../../../terrain/Terrain';
import { getTerrainHopsBetweenCoordinates } from './getTerrainHopsBetweenCoordinates';

describe('getContiguousObjects', () => {
	const space = new Terrain({
			id: 'space',
		}),
		world = new Terrain({
			id: 'world',
			parentage: { portalStart: [0, 0, 0], parentTerrain: space, portalEnd: [0, 0, 0] },
		}),
		buildingOne = new Terrain({
			id: 'building-1',
			parentage: { portalStart: [4, 0, 0], parentTerrain: world, portalEnd: [2, 0, 0] },
		}),
		buildingOneA = new Terrain({
			id: 'building-1a',
			parentage: { portalStart: [4, 0, 0], parentTerrain: buildingOne, portalEnd: [2, 0, 0] },
		}),
		buildingTwo = new Terrain({
			id: 'building-2',
			parentage: { portalStart: [0, 2, 0], parentTerrain: world, portalEnd: [2, 0, 0] },
		}),
		buildingTwoA = new Terrain({
			id: 'building-2a',
			parentage: { portalStart: [0, 2, 0], parentTerrain: buildingTwo, portalEnd: [2, 0, 0] },
		});

	it('Out and in of a building', () => {
		const path = getTerrainHopsBetweenCoordinates(
			[buildingOneA, 0, 0, 0],
			[buildingTwoA, 2, 0, 0],
		);

		expect(path[0]).toBe(buildingOneA);
		expect(path[1]).toBe(buildingOne);
		expect(path[2]).toBe(world);
		expect(path[3]).toBe(buildingTwo);
		expect(path[4]).toBe(buildingTwoA);

		expect(path).not.toContain(space);
		expect(path).toHaveLength(5);
	});
});
