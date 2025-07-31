import { generateGridTerrainFromAscii } from '../../../../test/generateGridTerrainFromAscii';
import { Terrain } from '../../../terrain/Terrain';
import { Tile } from '../../archetypes/tileArchetype';
import { getContiguousObjects } from './getContiguousObjects';

function filterWalkable(tile: Tile) {
	return tile.walkability > 0;
}
function getNeighbours(tile: Tile) {
	return tile.pathingNeighbours as Tile[];
}
describe('getContiguousObjects', () => {
	const terrain = new Terrain({
		tiles: generateGridTerrainFromAscii(`
			X-X-X
			--X-X
			XXXX-
		`),
	});
	it('Finds the expected amount of tiles #1', () => {
		const start = terrain.getTileAtMapLocation([0, 0, 0]);
		const island = getContiguousObjects(start, getNeighbours, filterWalkable);
		expect(island).toHaveLength(1);
	});
	it('Finds the expected amount of tiles #2', () => {
		const start = terrain.getTileAtMapLocation([2, 0, 0]);
		const island = getContiguousObjects(start, getNeighbours, filterWalkable);
		expect(island).toHaveLength(6);
	});
	it('Finds the expected amount of tiles #3', () => {
		const start = terrain.getTileAtMapLocation([4, 1, 0]);
		const island = getContiguousObjects(start, getNeighbours, filterWalkable);
		expect(island).toHaveLength(2);
	});
});
