import MeshBuilder from 'dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import React, { FunctionComponent } from 'react';
import { Coordinate, CoordinateArray } from '../classes/Coordinate';
import { DualMeshTerrainComponent } from './DualMeshTileComponent';

import { GenericTerrain, GenericTerrainComponentProps, GenericTile } from './GenericTerrain';

export class DualMeshTile extends GenericTile {
	public outlinePoints?: Coordinate[];
	public neighbors?: DualMeshTile[];
	public isOnBoundary?: boolean;

	static clone(coord: DualMeshTile) {
		const coord2 = new DualMeshTile(coord.x, coord.y, coord.z);
		coord2.isOnBoundary = coord.isOnBoundary;
		coord2.neighbors = coord.neighbors;
		coord2.outlinePoints = coord.outlinePoints;
		coord2.terrain = (coord as DualMeshTile).terrain;
		return coord2;
	}

	isLand() {
		return this.z >= 0 && !this.isOnBoundary;
	}
}

export class DualMeshTerrain extends GenericTerrain<DualMeshTile> {
	protected mesh: any;

	constructor(tiles: DualMeshTile[], mesh: any) {
		super(tiles);
		this.mesh = mesh;
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
		return center.neighbors || [];
	}
}

export function generateRandom(seed: string, size: number) {
	const distance = size / 10;
	const poisson = new Poisson(
		{
			shape: [size, size],
			minDistance: distance
		},
		Math.random
	);
	const meshBuilder = new MeshBuilder({ boundarySpacing: 0 });
	meshBuilder.points.forEach((p: [number, number]) => poisson.addPoint(p));
	meshBuilder.points = poisson.fill().map((xy: [number, number]) => [...xy, 0]);

	const mesh = meshBuilder.create();

	return new DualMeshTerrain(
		meshBuilder.points
			.map((coordinates: CoordinateArray, i: number) => new DualMeshTile(...coordinates))
			.map((tile: DualMeshTile, i: number, tiles: DualMeshTile[]) => {
				const outlinePointIndices = mesh.r_circulate_t([], i);
				tile.outlinePoints = outlinePointIndices.map(
					(i: number) => new Coordinate(mesh.t_x(i), mesh.t_y(i), tile.z)
				);

				tile.isOnBoundary = outlinePointIndices.some((index: number) =>
					mesh.t_ghost(index)
				);
				return tile;
			})
			.map((tile: DualMeshTile, i: number, tiles: DualMeshTile[]) => {
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
