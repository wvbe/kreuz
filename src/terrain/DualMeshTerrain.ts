import MeshBuilder from 'dual-mesh/create';
import Poisson from 'poisson-disk-sampling';
import React, { FunctionComponent } from 'react';
import { Coordinate, CoordinateArray } from '../classes/Coordinate';
import { InGameDistance } from '../space/PERSPECTIVE';
import { DualMeshTerrainComponent } from './DualMeshTileComponent';

import { GenericTerrain, GenericTerrainComponentProps, GenericTile } from './GenericTerrain';

export class DualMeshTile extends GenericTile {
	public readonly outlinePoints?: Coordinate[];

	constructor(
		x: InGameDistance,
		y: InGameDistance,
		z: InGameDistance,
		outlinePoints?: Coordinate[]
	) {
		super(x, y, z);
		this.outlinePoints = outlinePoints;
	}

	static clone(coord: DualMeshTile) {
		const coord2 = new DualMeshTile(coord.x, coord.y, coord.z, coord.outlinePoints);
		coord2.terrain = (coord as DualMeshTile).terrain;
		return coord2;
	}
}

export class DualMeshTerrain extends GenericTerrain<DualMeshTile> {
	protected mesh: any;

	constructor(tiles: DualMeshTile[], mesh: any) {
		super(tiles);
		this.tiles.forEach(coordinate => (coordinate.terrain = this));
		this.mesh = mesh;
	}

	override Component: FunctionComponent<GenericTerrainComponentProps<DualMeshTile>> = props =>
		React.createElement(DualMeshTerrainComponent, {
			terrain: this,
			...props
		});

	override getClosestToXy(x: number, y: number): DualMeshTile {
		const center = new Coordinate(x, y, 0);
		const { tile } = this.tiles.reduce<{ tile?: DualMeshTile; distance: number }>(
			(res, tile) => {
				const distance = center.euclideanDistanceTo(tile);
				console.log(distance, center, tile);
				if (distance < res.distance) {
					return { distance, tile };
				}
				return res;
			},
			{ distance: Infinity }
		);
		if (!tile) {
			throw new Error('No tiles, ' + this.tiles.length);
		}
		return tile;
	}

	override getNeighborTiles(center: DualMeshTile): DualMeshTile[] {
		throw new Error('Not implemented');
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
	const meshBuilder = new MeshBuilder({ boundarySpacing: distance });

	meshBuilder.points.forEach((p: [number, number]) => poisson.addPoint(p));
	meshBuilder.points = poisson.fill().map((xy: [number, number]) => [...xy, 0]);

	const mesh = meshBuilder.create();
	return new DualMeshTerrain(
		meshBuilder.points.map((c: CoordinateArray, i: number) => {
			const points = mesh
				.r_circulate_t([], i)
				.map((i: number) => new Coordinate(mesh.t_x(i), mesh.t_y(i), c[2]));
			const tile = new DualMeshTile(...c, points);

			return tile;
		}),
		mesh
	);
}
