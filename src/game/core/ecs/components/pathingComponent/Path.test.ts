import { expect } from '@jest/globals';
import { generateGridTerrainFromAscii } from '../../../../test/generateGridTerrainFromAscii';
import { Terrain } from '../../../terrain/Terrain';
import { Tile } from '../../archetypes/tileArchetype';
import { Path } from './Path';

function stringifyPath(path: Tile[]) {
	return path.map((tile) => tile.location.get().join('/'));
}
describe('Path.between', () => {
	describe('Within the same terrain', () => {
		// Where "x" is walkable, top-left is start and top-right is end.
		const terrain = new Terrain({
			id: 'world',
			tiles: generateGridTerrainFromAscii(`
				X-X-X
				X---X
				XXXXX
			`),
		});
		const tileStart = terrain.getTileAtMapLocation([0, 0, 0]);
		const tileDestination = terrain.getTileAtMapLocation([4, 0, 0]);
		const tileDisconnected = terrain.getTileAtMapLocation([2, 0, 0]);

		it('Start is destination', () => {
			const path = Path.between(tileStart, tileStart, {
				closest: false,
			});
			expect(stringifyPath(path)).toEqual(['world/0/0/1']);
		});
		it('Two different tiles', () => {
			const path = Path.between(tileStart, tileDestination, {
				closest: false,
			});
			expect(stringifyPath(path)).toEqual([
				'world/0/1/1',
				'world/0/2/1',
				'world/1/2/1',
				'world/2/2/1',
				'world/3/2/1',
				'world/4/2/1',
				'world/4/1/1',
				'world/4/0/1',
			]);
			expect(path).not.toContain(tileStart);
			expect(path).toContain(tileDestination);
		});
		it('Two disconnected tiles', () => {
			const path = Path.between(tileStart, tileDisconnected, {
				closest: false,
			});
			expect(path).toHaveLength(0);
		});
	});
	describe('Across a terrain graph', () => {
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
		it('Start sits on a portal', () => {
			const tileStart = buildingOne.getTileAtMapLocation([2, 0, 0]);
			const tileDestination = buildingTwo.getTileAtMapLocation([0, 0, 0]);
			const path = Path.between(tileStart, tileDestination, { closest: false });
			expect(stringifyPath(path)).toEqual([
				'world/4/0/1',
				'world/4/1/1',
				'world/4/2/1',
				'world/3/2/1',
				'world/2/2/1',
				'world/1/2/1',
				'world/0/2/1',
				'building-2/2/0/1',
				'building-2/1/0/1',
				'building-2/0/0/1',
			]);
			expect(path).not.toContain(tileStart);
			expect(path).toContain(tileDestination);
		});
		it('Destination sits on a portal', () => {
			const tileStart = buildingOne.getTileAtMapLocation([0, 0, 0]);
			const tileDestination = buildingTwo.getTileAtMapLocation([2, 0, 0]);
			const path = Path.between(tileStart, tileDestination, { closest: false });
			expect(stringifyPath(path)).toEqual([
				'building-1/0/1/1',
				'building-1/0/2/1',
				'building-1/1/2/1',
				'building-1/2/2/1',
				'building-1/2/1/1',
				'building-1/2/0/1',
				'world/4/0/1',
				'world/4/1/1',
				'world/4/2/1',
				'world/3/2/1',
				'world/2/2/1',
				'world/1/2/1',
				'world/0/2/1',
				'building-2/2/0/1',
			]);
			expect(path).not.toContain(tileStart);
			expect(path).toContain(tileDestination);
		});
		it('Both are on a portal', () => {
			const tileStart = buildingOne.getTileAtMapLocation([2, 0, 0]);
			const tileDestination = buildingTwo.getTileAtMapLocation([2, 0, 0]);
			const path = Path.between(tileStart, tileDestination, { closest: false });
			expect(stringifyPath(path)).toEqual([
				'world/4/0/1',
				'world/4/1/1',
				'world/4/2/1',
				'world/3/2/1',
				'world/2/2/1',
				'world/1/2/1',
				'world/0/2/1',
				'building-2/2/0/1',
			]);
			expect(path).not.toContain(tileStart);
			expect(path).toContain(tileDestination);
		});
		it('Neither are on a portal', () => {
			const tileStart = buildingOne.getTileAtMapLocation([0, 0, 0]);
			const tileDestination = buildingTwo.getTileAtMapLocation([0, 0, 0]);
			const path = Path.between(tileStart, tileDestination, { closest: false });
			expect(stringifyPath(path)).toEqual([
				'building-1/0/1/1',
				'building-1/0/2/1',
				'building-1/1/2/1',
				'building-1/2/2/1',
				'building-1/2/1/1',
				'building-1/2/0/1',
				'world/4/0/1',
				'world/4/1/1',
				'world/4/2/1',
				'world/3/2/1',
				'world/2/2/1',
				'world/1/2/1',
				'world/0/2/1',
				'building-2/2/0/1',
				'building-2/1/0/1',
				'building-2/0/0/1',
			]);
		});
	});
});
