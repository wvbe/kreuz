import React, { FunctionComponent } from 'react';
import { OUT_OF_BOUNDS, TerrainGenerator } from '../classes/TerrainGenerator';
import { RATIO_WATER_OF_TOTAL } from '../generators/hello-world';
import { CubicTerrainComponent } from './CubicTerrainComponent';
import { GenericTerrain, GenericTerrainComponentProps, GenericTile } from './GenericTerrain';

export class CubicTile extends GenericTile {
	// public terrain?: CubicTerrain;
	// static clone(coord: CubicTile) {
	// 	const coord2 = new CubicTile(coord.x, coord.y, coord.z);
	// 	coord2.terrain = (coord as CubicTile).terrain;
	// 	return coord2;
	// }
}

export class CubicTerrain extends GenericTerrain<CubicTile> {
	protected size: number;

	constructor(coordinates: CubicTile[]) {
		super(coordinates);
		this.tiles.forEach((coordinate) => (coordinate.terrain = this));

		this.size = Math.sqrt(this.tiles.length);
	}

	override Component: FunctionComponent<GenericTerrainComponentProps<CubicTile>> = (props) =>
		React.createElement(CubicTerrainComponent, { terrain: this, ...props });

	override getClosestToXy(x: number, y: number): CubicTile {
		if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) {
			// Out of bounds
			return this.tiles[0];
		}
		return this.tiles[this.getIndexForXy(x, y)];
	}

	override getNeighborTiles(center: CubicTile) {
		return [
			[-1, 0],
			[1, 0],
			[0, -1],
			[0, 1]
			// Diagonal neigbors not included
		]
			.map(([dx, dy]) => this.getClosestToXy(center.x + dx, center.y + dy))
			.filter(Boolean) as CubicTile[];
	}

	private getIndexForXy(x: number, y: number) {
		return this.size * y + x;
	}
}

export function generateRandom(seed: string, size: number) {
	const generator = new TerrainGenerator(seed, size);

	generator.generate(1);

	// For clarity, the terrain must currently always be square
	// @TODO fix that some time.
	const width = size,
		height = size;

	const coordinates = Array.from(new Array(width * height)).map<[number, number, number]>(
		(_, i) => {
			const x = i % width;
			const y = Math.floor(i / width);
			const z = generator.get(x, y);
			if (z === OUT_OF_BOUNDS) {
				throw new Error(`Out of bounds @ ${x}, ${y}`);
			}
			return [x, y, (2 * (z as number)) / size];
		}
	);

	const sortedHeights = coordinates.map((coordinate) => coordinate[2]).sort();
	const waterlineOffset = sortedHeights[Math.floor(sortedHeights.length * RATIO_WATER_OF_TOTAL)];
	return new CubicTerrain(
		coordinates.map(([x, y, z]) => new CubicTile(x, y, z - waterlineOffset))
	);
}
