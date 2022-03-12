import { FunctionComponent } from 'react';
import { Coordinate } from '../classes/Coordinate';
import { TerrainI, TileFilter, TileI } from '../types';

export class GenericTerrain implements TerrainI {
	/**
	 * Private
	 */

	//

	/**
	 * Public, shared code
	 */

	public readonly tiles: TileI[] = [];

	//

	constructor(tiles: TileI[]) {
		this.tiles = tiles;
	}

	public selectContiguousTiles(
		start: TileI,
		selector: TileFilter<TileI> = c => c.isLand(),
		inclusive: boolean
	): TileI[] {
		const island: TileI[] = [];
		const seen: TileI[] = [];
		const queue: TileI[] = [start];

		while (queue.length) {
			const current = queue.shift() as TileI;
			if (inclusive || current !== start) {
				island.push(current);
			}

			const neighbours = this.getNeighborTiles(current).filter(n => !seen.includes(n));
			seen.splice(0, 0, current, ...neighbours);
			queue.splice(0, 0, ...neighbours.filter(selector));
		}
		return island;
	}

	//
	public selectClosestTiles(start: TileI, maxDistance: number): TileI[] {
		return this.selectContiguousTiles(
			start,
			other => other.isLand() && start.euclideanDistanceTo(other) <= maxDistance,
			false
		);
	}

	//
	protected islands: Map<TileFilter<TileI>, TileI[][]> = new Map();
	public getIslands(selector: TileFilter<TileI> = t => t.isLand()): TileI[][] {
		const fromCache = this.islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.tiles.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as TileI;
			if (!selector(next)) {
				continue;
			}
			const island = this.selectContiguousTiles(next, selector, true);
			open = open.filter(n => !island.includes(n));
			islands.push(island);
		}

		this.islands.set(selector, islands);
		return islands;
	}

	/**
	 * Abstract methods
	 */

	//
	public getTileClosestToXy(x: number, y: number): TileI {
		if (!this.tiles.length) {
			throw new Error('Terrain is empty');
		}
		let closestDistance = Infinity;
		return this.tiles.reduce<TileI>((last, tile) => {
			const distance = tile.euclideanDistanceTo(x, y, 0);
			if (distance < closestDistance) {
				closestDistance = distance;
				return tile;
			} else {
				return last;
			}
		}, this.tiles[0]);
	}

	//
	public getNeighborTiles(center: TileI): TileI[] {
		return this.tiles.filter(tile => center.manhattanDistanceTo(tile) === 1);
	}

	public getMedianCoordinate() {
		const { x, y, z } = this.tiles.reduce(
			(totals, tile) => ({
				x: totals.x + tile.x,
				y: totals.y + tile.y,
				z: totals.z + tile.z
			}),
			{ x: 0, y: 0, z: 0 }
		);
		return new Coordinate(x / this.tiles.length, y / this.tiles.length, z / this.tiles.length);
	}

	/**
	 * Statics
	 */

	//
	static generateRandom(seed: string, size: number): GenericTerrain {
		throw new Error('Not implemented');
	}
}

export type GenericTerrainComponentProps<Tile extends TileI> = {
	onTileContextMenu?: (event: React.MouseEvent<SVGGElement>, tile: Tile) => void;
};

export type GenericTerrainComponentI<Terrain extends TerrainI, Tile extends TileI> =
	FunctionComponent<
		{
			terrain: Terrain;
		} & GenericTerrainComponentProps<Tile>
	>;
