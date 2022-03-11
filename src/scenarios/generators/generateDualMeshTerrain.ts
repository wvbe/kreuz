import MeshBuilder from '@redblobgames/dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import { DualMeshTerrain } from '../../terrain/DualMeshTerrain';
import { CoordinateArray } from '../../classes/Coordinate';
import { Random } from '../../classes/Random';
import { DualMeshTile } from '../../terrain/DualMeshTile';
import { SeedI } from '../../types';

export function generateDualMeshTerrain(seed: SeedI, size: number, density: number = 1) {
	// Use @redblobgames/dual-mesh to generate tiles and relationships.
	// More information:
	// - https://redblobgames.github.io/dual-mesh/
	// - https://github.com/redblobgames/dual-mesh
	let i = 0;
	const poisson = new Poisson(
		{
			shape: [size, size],
			minDistance: 1 / density
		},
		() => Random.float(seed, ++i)
	);
	const meshBuilder = new MeshBuilder({ boundarySpacing: 1 });
	meshBuilder.points.forEach((p: [number, number]) => poisson.addPoint(p));
	meshBuilder.points = poisson.fill().map((xy: [number, number], i: number) => {
		const z = (Random.float(seed, 'poisson', i) - 0.3) * 2; // < 0.3 ? -0.1 : 0
		return [...xy, z > 0 ? z * 0.25 : z];
	});

	const mesh = meshBuilder.create();
	const tiles = (meshBuilder.points as Array<CoordinateArray>)
		.map((coordinates, i) => {
			const outline = mesh.r_circulate_t([], i);
			return new DualMeshTile(
				...coordinates,
				outline.map((i: number) => [mesh.t_x(i), mesh.t_y(i)]),
				outline.some((index: number) => mesh.t_ghost(index))
			);
		})
		.map((tile, i, tiles) => {
			mesh.r_circulate_r([], i)
				.map((x: keyof DualMeshTerrain['tiles']) => tiles[x])
				.filter(Boolean)
				.forEach((neighbor: DualMeshTile) => {
					tile.neighbors.push(neighbor);
				});

			return tile;
		})
		.filter(Boolean);

	const terrain = new DualMeshTerrain(size, tiles);

	return terrain;
}
