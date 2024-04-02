import {
	Coordinate,
	EcsEntity,
	Random,
	Terrain,
	locationComponent,
	outlineComponent,
	pathableComponent,
	surfaceComponent,
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

export function generateDualMeshTerrain(seed: SeedI, size: number, density: number = 1) {
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
		.map<TileEntity>(([x, y, z], i) => {
			const entity = { id: `dual-mesh-tile-${i}` };
			locationComponent.attach(entity, { location: [x, y, z] });
			outlineComponent.attach(entity, {
				outlineCoordinates: mesh
					.r_circulate_t([], i)
					.map((i: number) => new Coordinate(mesh.t_x(i) - x, mesh.t_y(i) - y, z)),
			});
			surfaceComponent.attach(entity, {
				surfaceColor: z >= 0 ? 'red' : 'green',
			});
			pathableComponent.attach(entity, { walkability: z >= 0 ? 1 : 0 });
			return entity as TileEntity;
		})
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

	const terrain = new Terrain(size, tiles);

	return terrain;
}
