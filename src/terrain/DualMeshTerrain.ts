import MeshBuilder from 'dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import React, { FunctionComponent } from 'react';
import { Coordinate, CoordinateArray } from '../classes/Coordinate';
import { Random } from '../util/Random';
import { DualMeshTerrainComponent } from './DualMeshTileComponent';

import { GenericTerrain, GenericTerrainComponentProps, GenericTile } from './GenericTerrain';

export class DualMeshTile extends GenericTile {
	public _neighbors?: DualMeshTile[];
	public _outlinePoints?: Coordinate[];
	public _isGhost?: boolean;
	private _isLand?: boolean = undefined;

	isLand() {
		if (this._isLand === undefined) {
			// Return a subset of tiles to reduce "ugly" shapes and the
			this._isLand =
				// Must be above the waterline:
				this.z >= 0 &&
				// And must be at least <4> neighbors away from an outermost tile
				!(function r(item: DualMeshTile, maxDepth: number): boolean {
					if (item._isGhost) {
						return true;
					}
					if (maxDepth <= 0) {
						return false;
					}

					--maxDepth;
					return item._neighbors?.some(n => r(n, maxDepth)) || false;
				})(this, 2);
		}
		return this._isLand;
	}
}

export class DualMeshTerrain extends GenericTerrain<DualMeshTile> {
	// private mesh: any;

	constructor(tiles: DualMeshTile[], _mesh: any) {
		super(tiles);
		// this.mesh = mesh;
		this.tiles.forEach((coordinate, i) => {
			coordinate.terrain = this;
		});
	}

	override Component: FunctionComponent<GenericTerrainComponentProps<DualMeshTile>> = props =>
		React.createElement(DualMeshTerrainComponent, {
			terrain: this,
			...props
		});

	override getClosestToXy(x: number, y: number): DualMeshTile {
		const center = new Coordinate(x, y, 0);
		const { tile } = this.tiles.reduce<{ tile?: DualMeshTile; distance: number }>(
			(last, tile) => {
				const distance = center.euclideanDistanceTo(tile);
				return distance < last.distance ? { distance, tile } : last;
			},
			{ distance: Infinity }
		);
		if (!tile) {
			throw new Error('No tiles, ' + this.tiles.length);
		}
		return tile;
	}

	override getNeighborTiles(center: DualMeshTile): DualMeshTile[] {
		return center._neighbors || [];
	}
}

export function generateRandom(seed: string, size: number, density: number = 1) {
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
		() => Random.float(`${seed}/${++i}`)
	);
	const meshBuilder = new MeshBuilder({ boundarySpacing: 1 });
	meshBuilder.points.forEach((p: [number, number]) => poisson.addPoint(p));
	meshBuilder.points = poisson
		.fill()
		.map((xy: [number, number], i: number) => [
			...xy,
			(-0.2 + Random.float(seed, ...xy)) * 0.4
		]);

	const mesh = meshBuilder.create();
	const tiles = (meshBuilder.points as Array<CoordinateArray>)
		.map((coordinates, i) => new DualMeshTile(...coordinates))
		.map((tile, i) => {
			const outlinePointIndices = mesh.r_circulate_t([], i);
			tile._outlinePoints = outlinePointIndices.map(
				(i: number) => new Coordinate(mesh.t_x(i), mesh.t_y(i), tile.z)
			);

			tile._isGhost = outlinePointIndices.some((index: number) => mesh.t_ghost(index));
			return tile;
		})
		.map((tile, i, tiles) => {
			tile._neighbors = mesh
				.r_circulate_r([], i)
				.map((x: keyof DualMeshTerrain['tiles']) => tiles[x])
				.filter(Boolean);

			return tile;
		})
		.filter(Boolean);

	const terrain = new DualMeshTerrain(tiles, mesh);

	// terrain
	// 	.getIslands(t => t.isLand())
	// 	.forEach(island => {
	// 		const { x, y } = island.reduce(
	// 			(c, t) => c.transform(t.x, t.y, t.z),
	// 			new Coordinate(0, 0, 0)
	// 		);
	// 		const centerIsh = terrain.getClosestToXy(x / island.length, y / island.length);
	// 		console.log(centerIsh);
	// 		if (!island.includes(centerIsh)) {
	// 			return;
	// 		}
	// 		terrain.selectClosestTiles(centerIsh, size / 3).forEach(t => t.transform(0, 0, 5));
	// 	});

	// for (let iterations = 25; iterations > 0; --iterations) {
	// 	terrain.tiles.forEach(t => {
	// 		t.z = t._neighbors
	// 			? 0.5 * t.z +
	// 			  (0.5 * t._neighbors.reduce((tot, tt) => (tot += tt.z), 0)) / t._neighbors.length
	// 			: t.z;
	// 	});
	// }

	return terrain;
}
