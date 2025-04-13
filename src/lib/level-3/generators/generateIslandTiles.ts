import { tileArchetype } from '../../level-1/ecs/archetypes';
import { EcsArchetypeEntity } from '../../level-1/ecs/ecs';
import { Random, SeedI } from '../../level-1/random';
import { SurfaceType } from '../../level-1/terrain';

type Tile = EcsArchetypeEntity<typeof tileArchetype>;

const adjacency = [
	[-1, 0],
	[1, 0],
	[0, 1],
	[0, -1],
];

/**
 * Creates at least one free empty tile (at 0,0), and then attempts to excavate its neighbours, and
 * neighbours of its neighbours, etc. for a few generations. Because there is a random change of
 * fail/success, the result is an unidentified island shape of tiles.
 */
export function generateIslandTiles(seed: SeedI[]) {
	const tiles: Tile[] = [
		tileArchetype.create({
			location: [0, 0, 0],
			surfaceType: SurfaceType.OPEN,
			outlineCoordinates: [
				[-0.5, -0.5, 0],
				[0.5, -0.5, 0],
				[0.5, 0.5, 0],
				[-0.5, 0.5, 0],
			],
		}),
	];

	(function grow(originTiles: Tile[], iterationsRemaining: number) {
		const nextGenerationTiles: Tile[] = [];
		originTiles.forEach((tile) => {
			const [x, y] = tile.location.get();
			[
				[x + 1, y],
				[x - 1, y],
				[x, y + 1],
				[x, y - 1],
			].forEach(([nx, ny]) => {
				if (tiles.some((t) => t.location.get()[0] === nx && t.location.get()[1] === ny)) {
					return;
				}
				if (Random.boolean([nx, ny, ...seed], 0.25)) {
					return;
				}
				const newTile = tileArchetype.create({
					location: [nx, ny, 0],
					surfaceType: SurfaceType.OPEN,
					outlineCoordinates: [
						[-0.5, -0.5, 0],
						[0.5, -0.5, 0],
						[0.5, 0.5, 0],
						[-0.5, 0.5, 0],
					],
				});
				nextGenerationTiles.push(newTile);
				tiles.push(newTile);
			});
		});
		if (nextGenerationTiles.length && iterationsRemaining > 0) {
			grow(nextGenerationTiles, --iterationsRemaining);
		}
	})(tiles, 10);

	tiles.forEach((tile) => {
		const [x, y] = tile.location.get();
		tile.pathingNeighbours.push(
			...adjacency
				.map(([dx, dy]) =>
					tiles.find(
						(t) => t.location.get()[0] === x + dx && t.location.get()[1] === y + dy,
					),
				)
				.filter((thing): thing is Tile => tileArchetype.test(thing)),
		);
	});

	return tiles;
}
