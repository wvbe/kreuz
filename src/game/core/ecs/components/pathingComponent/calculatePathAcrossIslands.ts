import { Terrain } from '../../../terrain/Terrain';
import { SimpleCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';
import { EcsEntity } from '../../types';
import { isMapLocationEqualTo } from '../location/isMapLocationEqualTo';
import { locationComponent } from '../locationComponent';
import { Path } from './Path';

type TerrainIsland = {
	tiles: Tile[];
	neighbours: TerrainIsland[];
};

export function calculatePathAcrossIslands(
	entity: EcsEntity<typeof locationComponent>,
	destination: Tile,
) {
	const start = entity.location.get();
	const [startTerrain, ...startCoordinates] = start;
	const startTile = startTerrain.getTileAtMapLocation(startCoordinates);
	if (!startTile) {
		throw new Error('Could not find the start tile');
	}

	let destinationIsland: TerrainIsland | null = null;

	// Umm should I record `visitedIslands` instead?
	const visitedTerrains: Terrain[] = [];

	const startIsland = (function buildIslandGraph(tile: Tile) {
		const [terrain] = tile.location.get();
		console.log('Checking terrain', terrain.toString());
		visitedTerrains.push(terrain);

		// By querying all islands, rather than just look for the current island, we can benefit
		// from a cache that builds up in Terrain.#islands.
		const islands = terrain.getIslands().map<TerrainIsland>((tiles) => ({
			tiles,
			neighbours: [],
		}));

		const currentIsland = islands.find((island) => island.tiles.includes(tile));
		if (!currentIsland) {
			throw new Error('Could not find the current island');
		}

		if (!destinationIsland && currentIsland.tiles.includes(destination)) {
			destinationIsland = currentIsland;
		}

		const neighbours = terrain
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
			.map(({ terrain }) => {
				const tileToArriveOn = terrain.getTileAtMapLocation(terrain.portalEnd);
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

	return pathAcrossTerrains;
}
