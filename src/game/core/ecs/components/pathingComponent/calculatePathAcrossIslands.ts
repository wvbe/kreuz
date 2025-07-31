import { Terrain } from '../../../terrain/Terrain';
import { QualifiedCoordinate, SimpleCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';
import { isMapLocationEqualTo } from '../location/isMapLocationEqualTo';
import { Path } from './Path';

type TerrainIsland = {
	tiles: Tile[];
	neighbours: TerrainIsland[];
};

export function calculatePathAcrossIslands(
	[startTerrain, ...startCoordinates]: QualifiedCoordinate,
	[destinationTerrain, ...destinationCoordinates]: QualifiedCoordinate,
) {
	const startTile = startTerrain.getTileAtMapLocation(startCoordinates);
	if (!startTile) {
		throw new Error('Could not find the start tile');
	}

	const destinationTile = destinationTerrain.getTileAtMapLocation(destinationCoordinates);
	if (!destinationTile) {
		throw new Error('Could not find the destination tile');
	}

	let destinationIsland: TerrainIsland | null = null;
	// Umm should I record `visitedIslands` instead?
	const visitedTerrains: Terrain[] = [];

	const startIsland = (function buildIslandGraph(tile: Tile) {
		const [currentTerrain] = tile.location.get();
		console.log('Checking terrain', currentTerrain.toString());
		visitedTerrains.push(currentTerrain);

		// By querying all islands, rather than just look for the current island, we can benefit
		// from a cache that builds up in Terrain.#islands.
		const islands = currentTerrain.getIslands().map<TerrainIsland>((tiles) => ({
			tiles,
			neighbours: [],
		}));

		const currentIsland = islands.find((island) => island.tiles.includes(tile));
		if (!currentIsland) {
			throw new Error('Could not find the current island');
		}

		if (!destinationIsland && currentIsland.tiles.includes(destinationTile)) {
			destinationIsland = currentIsland;
		}

		const neighbours = currentTerrain
			.getAdjacentTerrains()
			.filter((adjacent) => {
				if (visitedTerrains.includes(adjacent.terrain)) {
					return false;
				}
				return currentIsland.tiles.some((tile) =>
					isMapLocationEqualTo(
						tile.location.get().slice(1) as SimpleCoordinate,
						adjacent.portalStart,
					),
				);
			})
			.map(({ terrain: destinationTerrain, portalStart }) => {
				const tileToArriveOn = destinationTerrain.getTileAtMapLocation(
					destinationTerrain.getLocationOfPortalToTerrain(currentTerrain),
				);
				if (!tileToArriveOn) {
					throw new Error('Could not find the tile to arrive on');
				}
				// Recurse from where the user arrives into terrain
				return buildIslandGraph(tileToArriveOn);
			});
		console.log('Neighbours', neighbours.length);
		currentIsland.neighbours.push(...neighbours);

		return currentIsland;
	})(startTile);

	if (!destinationIsland) {
		throw new Error(`Destination is not in a reachable island`);
	}

	const pathAcrossTerrains = Path.forTerrainIslands(startIsland, {
		closest: false,
	}).to(destinationIsland);

	return [startIsland, ...pathAcrossTerrains];
}
