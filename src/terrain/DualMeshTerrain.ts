import MeshBuilder from 'dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import React, { FunctionComponent } from 'react';
import { Coordinate, CoordinateArray } from '../classes/Coordinate';
import { Random } from '../util/Random';
import { DualMeshTerrainComponent } from './DualMeshTileComponent';

import { GenericTerrain, GenericTerrainComponentProps, GenericTile } from './GenericTerrain';

export class DualMeshTile extends GenericTile {
	public neighbors?: DualMeshTile[];
	public outlinePoints?: Coordinate[];
	public isGhost?: boolean;

	// static clone(coord: DualMeshTile) {
	// 	const coord2 = new DualMeshTile(coord.x, coord.y, coord.z);
	// 	coord2.isGhost = coord.isGhost;
	// 	coord2.neighbors = coord.neighbors;
	// 	coord2.outlinePoints = coord.outlinePoints;
	// 	coord2.terrain = coord.terrain;
	// 	return coord2;
	// }

	private _isLand?: boolean = undefined;
	isLand() {
		if (this._isLand === undefined) {
			// Return a subset of tiles to reduce "ugly" shapes and the
			this._isLand =
				// Must be above the waterline:
				this.z >= 0 &&
				// And must be at least <4> neighbors away from an outermost tile
				!(function r(item: DualMeshTile, maxDepth: number): boolean {
					if (item.isGhost) {
						return true;
					}
					if (maxDepth <= 0) {
						return false;
					}

					--maxDepth;
					return item.neighbors?.some((n) => r(n, maxDepth)) || false;
				})(this, 2);
		}
		return this._isLand;
	}
}

export class DualMeshTerrain extends GenericTerrain<DualMeshTile> {
	private mesh: any;

	constructor(tiles: DualMeshTile[], mesh: any) {
		super(tiles);
		this.mesh = mesh;
		this.tiles.forEach((coordinate, i) => {
			coordinate.terrain = this;
		});
	}

	override Component: FunctionComponent<GenericTerrainComponentProps<DualMeshTile>> = (props) =>
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
		return center.neighbors || [];
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
			(-0.2 + Random.float(seed, ...xy)) * 0.2
		]);

	const mesh = meshBuilder.create();
	return new DualMeshTerrain(
		(meshBuilder.points as Array<CoordinateArray>)
			.map((coordinates, i) => new DualMeshTile(...coordinates))
			.map((tile, i) => {
				const outlinePointIndices = mesh.r_circulate_t([], i);
				tile.outlinePoints = outlinePointIndices.map(
					(i: number) => new Coordinate(mesh.t_x(i), mesh.t_y(i), tile.z)
				);

				tile.isGhost = outlinePointIndices.some((index: number) => mesh.t_ghost(index));
				return tile;
			})
			.map((tile, i, tiles) => {
				tile.neighbors = mesh
					.r_circulate_r([], i)
					.map((x: keyof DualMeshTerrain['tiles']) => tiles[x])
					.filter(Boolean);

				return tile;
			})
			.filter(Boolean),
		mesh
	);
}
