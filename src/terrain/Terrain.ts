import { Coordinate } from '../classes/Coordinate.ts';
import { CoordinateI, TerrainI, TileFilter, TileI } from '../types.ts';
import { SaveTerrainJson } from '../types-savedgame.ts';
import { Tile } from './Tile.ts';

export class Terrain implements TerrainI {
	public readonly tiles: TileI[] = [];
	public readonly size: number;

	constructor(size: number, tiles: TileI[]) {
		this.tiles = tiles;
		this.size = size;
		// this.mesh = mesh;
		this.tiles.forEach((coordinate, i) => {
			coordinate.terrain = this;
		});
	}

	public selectContiguousTiles(
		start: TileI,
		selector: TileFilter<TileI> = (c) => c.isLand(),
		inclusive: boolean,
	): TileI[] {
		const island: TileI[] = [];
		const seen: TileI[] = [];
		const queue: TileI[] = [start];

		while (queue.length) {
			const current = queue.shift() as TileI;
			if (inclusive || current !== start) {
				island.push(current);
			}

			const neighbours = this.getNeighborTiles(current).filter((n) => !seen.includes(n));
			seen.splice(0, 0, current, ...neighbours);
			queue.splice(0, 0, ...neighbours.filter(selector));
		}
		return island;
	}

	public selectClosestTiles(start: CoordinateI, maxDistance: number): TileI[] {
		return this.selectContiguousTiles(
			this.getTileClosestToXy(start.x, start.y),
			(other) => other.isLand() && start.euclideanDistanceTo(other) <= maxDistance,
			false,
		);
	}

	private _islands: Map<TileFilter<TileI>, TileI[][]> = new Map();
	/**
	 * Get a list of tiles that are geographically contiguous.
	 */
	public getIslands(selector: TileFilter<TileI> = (t) => t.isLand()): TileI[][] {
		const fromCache = this._islands.get(selector);
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
			open = open.filter((n) => !island.includes(n));
			islands.push(island);
		}

		this._islands.set(selector, islands);
		return islands;
	}

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

	public getNeighborTiles(center: TileI): TileI[] {
		return center.neighbors;
	}

	private _medianCoordinate: Coordinate | null = null;
	public getMedianCoordinate(forceRenew?: boolean) {
		if (!this._medianCoordinate || forceRenew) {
			const { x, y, z } = this.tiles.reduce(
				(totals, tile) => ({
					x: totals.x + tile.x,
					y: totals.y + tile.y,
					z: totals.z + tile.z,
				}),
				{ x: 0, y: 0, z: 0 },
			);
			this._medianCoordinate = new Coordinate(
				x / this.tiles.length,
				y / this.tiles.length,
				z / this.tiles.length,
			);
		}
		return this._medianCoordinate;
	}

	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveTerrainJson {
		return {
			tiles: this.tiles.map((tile) => tile.serializeToSaveJson()),
			size: this.size,
		};
	}
}
