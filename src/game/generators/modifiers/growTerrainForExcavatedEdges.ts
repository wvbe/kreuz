import { tileArchetype } from '../../core/ecs/archetypes/tileArchetype';
import { SurfaceType } from '../../core/ecs/components/surfaceComponent';
import { EcsArchetypeEntity } from '../../core/ecs/types';
import Game from '../../core/Game';
import { SimpleCoordinate } from '../../core/terrain/types';

function hallucinateMissingNeighbors(
	originTile: EcsArchetypeEntity<typeof tileArchetype>,
	otherNewTiles: { location: SimpleCoordinate; surfaceType: SurfaceType }[],
): { location: SimpleCoordinate; surfaceType: SurfaceType }[] {
	const margin = 1;
	const tiles: { location: SimpleCoordinate; surfaceType: SurfaceType }[] = [];
	const [terrain, originX, originY, z] = originTile.location.get();
	for (let hallucinatedX = originX - margin; hallucinatedX <= originX + margin; hallucinatedX++) {
		for (
			let hallucinatedY = originY - margin;
			hallucinatedY <= originY + margin;
			hallucinatedY++
		) {
			if (hallucinatedX === originX && hallucinatedY === originY) {
				continue;
			}
			if (terrain.getTileAtMapLocation([hallucinatedX, hallucinatedY, z], true)) {
				continue;
			}
			if (
				otherNewTiles.find(
					(tile) =>
						tile.location[0] === hallucinatedX && tile.location[1] === hallucinatedY,
				)
			) {
				continue;
			}
			tiles.push({
				location: [hallucinatedX, hallucinatedY, z],
				surfaceType: SurfaceType.UNKNOWN,
			});
		}
	}
	return tiles;
}

/**
 * When associated with the terrain.tiles.$add event, this function will grow the terrain
 * by one undiscovered tile around every tile that is excavated on the (former) edge of the terrain.
 * This essentially makes the terrain infinitely large, because you can excavate it infinitely much.
 *
 * @deprecated A better way to implement this is to invent a system where you can select tile (coordinates)
 * for tiles that dont exist yet.
 */
export async function growTerrainForExcavatedEdges(
	this: Game,
	tiles: EcsArchetypeEntity<typeof tileArchetype>[],
) {
	const newTiles = tiles
		.filter(
			(tile) =>
				tile.surfaceType.get() === SurfaceType.OPEN && tile.pathingNeighbours.length < 4,
		)
		.reduce(
			(newTiles, tile) => [...newTiles, ...hallucinateMissingNeighbors(tile, newTiles)],
			[] as { location: SimpleCoordinate; surfaceType: SurfaceType }[],
		);

	// Newly excavated tiles should also be surrounded by (filled in) neighbors
	for (const tile of tiles) {
		tile.surfaceType.on(async (surfaceType) => {
			if (surfaceType === SurfaceType.OPEN) {
				await this.terrain.addTiles(hallucinateMissingNeighbors(tile, []));
			}
		});
	}
	await this.terrain.addTiles(newTiles);
}
