import {
	EcsArchetypeEntity,
	EcsEntity,
	Random,
	SurfaceType,
	Terrain,
	locationComponent,
	outlineComponent,
	pathableComponent,
	surfaceComponent,
	tileArchetype,
	type SeedI,
} from '@lib/core';
import MeshBuilder from '@redblobgames/dual-mesh/create';
import Poisson from 'poisson-disk-sampling';

type TileEntity = EcsEntity<
	| typeof locationComponent
	| typeof outlineComponent
	| typeof surfaceComponent
	| typeof pathableComponent
>;

export function generateDualMeshTiles(
	seed: SeedI,
	size: number,
	density: number = 1,
): EcsArchetypeEntity<typeof tileArchetype>[] {
	// Use @redblobgames/dual-mesh to generate tiles and relationships.
	// More information:
	// - https://redblobgames.github.io/dual-mesh/
	// - https://github.com/redblobgames/dual-mesh
	let i = 0;
	const poisson = new Poisson(
		{
			shape: [size, size],
			minDistance: 1 / density,
		},
		function generateRandomFloatForPoisson() {
			// This is the most expensive function in generating terrain:
			return Random.float(seed, ++i);
		},
	);
	const meshBuilder = new MeshBuilder({ boundarySpacing: 1 });
	meshBuilder.points.forEach((p) => poisson.addPoint(p));
	meshBuilder.points = poisson.fill().map((xy, i: number) => {
		const z = (Random.float(seed, 'poisson', i) - 0.3) * 2; // < 0.3 ? -0.1 : 0
		return [...xy, z > 0 ? z * 0.25 : z];
	});

	const mesh = meshBuilder.create();

	const tiles = meshBuilder.points
		.map(([x, y, z], i) =>
			tileArchetype.create({
				location: [x, y, z],
				outlineCoordinates: mesh
					.r_circulate_t([], i)
					.map((i: number) => [mesh.t_x(i) - x, mesh.t_y(i) - y, z]),
				surfaceType: z >= 0 ? SurfaceType.OPEN : SurfaceType.UNKNOWN,
			}),
		)
		.map((tile, i, tiles) => {
			if (pathableComponent.test(tile)) {
				tile.pathingNeighbours.push(
					...mesh
						.r_circulate_r([], i)
						.map((x: number) => tiles[x])
						.filter(Boolean),
				);
			}
			return tile;
		});

	return tiles;
}
