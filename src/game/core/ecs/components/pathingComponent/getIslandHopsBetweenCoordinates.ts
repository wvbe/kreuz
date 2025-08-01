import { Terrain } from '../../../terrain/Terrain';
import { QualifiedCoordinate, SimpleCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';
import { isMapLocationEqualTo } from '../location/isMapLocationEqualTo';
import { Path } from './Path';

type TerrainIsland = {
	tiles: Tile[];
	neighbours: TerrainIsland[];
};

/**
 * This function calculates the hops you must make between different terrain/tile islands (contiguous
 * groups of tiles). This is smart becaues it could find a path around two disconnected islands in
 * the same terrain if there is a bridging other terrain.
 *
 * @deprecated
 * This code is not in use because that only happens if there are multiple connections between the
 * same two terrains. Terrains are in a tree with one another, so this never happens.
 */
export function getIslandHopsBetweenCoordinates(
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

	const startIsland = (function buildIslandGraph(tile: Tile): TerrainIsland {
		const [currentTerrain] = tile.location.get();
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
			.getPortals()
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
