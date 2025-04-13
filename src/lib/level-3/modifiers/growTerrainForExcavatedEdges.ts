import { byEcsArchetype, tileArchetype } from '../../level-1/ecs/archetypes';
import { EcsArchetypeEntity } from '../../level-1/ecs/ecs';
import { Game } from '../../level-1/game';
import { SurfaceType } from '../../level-1/terrain';

function hallucinateMissingNeighbors(
	game: Game,
	tile: EcsArchetypeEntity<typeof tileArchetype>,
	otherNewTiles: EcsArchetypeEntity<typeof tileArchetype>[],
): EcsArchetypeEntity<typeof tileArchetype>[] {
	const [originX, originY, z] = tile.location.get();
	return [
		[originX - 1, originY],
		[originX + 1, originY],
		[originX, originY - 1],
		[originX, originY + 1],
	]
		.map(([hallucinatedX, hallucinatedY]) => {
			if (game.terrain.getTileEqualToLocation([hallucinatedX, hallucinatedY, z], true)) {
				return null;
			}
			if (
				otherNewTiles.find((tile) =>
					tile.equalsMapLocation([hallucinatedX, hallucinatedY, z]),
				)
			) {
				return null;
			}
			const tile = tileArchetype.create({
				location: [hallucinatedX, hallucinatedY, z],
				surfaceType: SurfaceType.UNKNOWN,
				outlineCoordinates: [
					[-0.5, -0.5, 0],
					[0.5, -0.5, 0],
					[0.5, 0.5, 0],
					[-0.5, 0.5, 0],
				],
			});
			for (const [xx, yy] of [
				[hallucinatedX - 1, hallucinatedY],
				[hallucinatedX + 1, hallucinatedY],
				[hallucinatedX, hallucinatedY - 1],
				[hallucinatedX, hallucinatedY + 1],
			]) {
				const t =
					otherNewTiles.find((tile) => tile.equalsMapLocation([xx, yy, z])) ||
					game.terrain.getTileEqualToLocation([xx, yy, z], true);
				if (t) {
					tile.pathingNeighbours.push(t);
					t.pathingNeighbours.push(tile);
				}
			}
			return tile;
		})
		.filter(byEcsArchetype(tileArchetype));
}

/**
 * When associated with the game.terrain.tiles.$add event, this function will grow the terrain
 * by one undiscovered tile around every tile that is excavated on the (former) edge of the terrain.
 * This essentially makes the terrain infinitely large, because you can excavate it infinitely much.
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
			(newTiles, tile) => [...newTiles, ...hallucinateMissingNeighbors(this, tile, newTiles)],
			[] as EcsArchetypeEntity<typeof tileArchetype>[],
		);

	for (const tile of tiles) {
		tile.surfaceType.on(async (surfaceType) => {
			if (surfaceType === SurfaceType.OPEN) {
				const newTiles = hallucinateMissingNeighbors(this, tile, []);
				if (newTiles.length) {
					await this.entities.add(...newTiles);
				}
			}
		});
	}
	await this.entities.add(...newTiles);
}
