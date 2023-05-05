import { Coordinate } from './Coordinate.ts';
import { SaveTerrainJson } from '../types-savedgame.ts';
import { CoordinateI, FilterFn, TileI } from '../types.ts';

export class Terrain {
	readonly #tiles: TileI[] = [];
	public readonly size: number;

	constructor(size: number, tiles: TileI[]) {
		this.#tiles = tiles;
		this.size = size;
		// this.mesh = mesh;
		for (const coordinate of this.#tiles) {
			coordinate.terrain = this;
		}
	}

	/**
	 * Array of all tiles that make up this terrain.
	 */
	get tiles(): TileI[] {
		return this.#tiles;
	}

	public getTileEqualToLocation(location: CoordinateI, lax?: false): TileI;
	public getTileEqualToLocation(location: CoordinateI, lax?: true): TileI | null;
	public getTileEqualToLocation(location: CoordinateI, lax?: boolean) {
		const tile = this.#tiles.find((tile) => location.equals(tile)) || null;
		if (!tile && !lax) {
			throw new Error(`No time matches coordinate ${location} exactly`);
		}
		return tile;
	}

	/**
	 * Array of all tiles that make up this terrain.
	 */
	public selectContiguousTiles(
		start: TileI,
		selector: FilterFn<TileI> = (c) => c.isLand(),
		inclusive = true,
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

	/**
	 * Get the tiles closest to the starting tile (not counting the starting tile itself).
	 */
	public selectClosestTiles(start: CoordinateI, maxDistance: number): TileI[] {
		return this.selectContiguousTiles(
			this.getTileClosestToXy(start.x, start.y),
			(other) => other.isLand() && start.euclideanDistanceTo(other) <= maxDistance,
			false,
		);
	}

	#islands: Map<FilterFn<TileI>, TileI[][]> = new Map();

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 */
	public getIslands(selector: FilterFn<TileI> = (t) => t.isLand()): TileI[][] {
		const fromCache = this.#islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.#tiles.slice();
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

		this.#islands.set(selector, islands);
		return islands;
	}

	public getTileEqualToXy(x: number, y: number): TileI | null {
		return this.#tiles.find((tile) => tile.x === x && tile.y === y) || null;
	}

	/**
	 * Its _possible_ that an entity lives on a tile that has so much elevation that
	 * .getTileClosestToXy actually finds the _wrong_ tile -- because its neighbor is closer than
	 * the proximity to z=0.
	 */
	public getTileClosestToXy(x: number, y: number): TileI {
		if (!this.#tiles.length) {
			throw new Error('Terrain is empty');
		}
		let closestDistance = Infinity;
		return this.#tiles.reduce<TileI>((last, tile) => {
			const distance = tile.euclideanDistanceTo(x, y, 0);
			if (distance < closestDistance) {
				closestDistance = distance;
				return tile;
			} else {
				return last;
			}
		}, this.#tiles[0]);
	}

	/**
	 * Get the tiles that are adjacent to another tile.
	 */
	public getNeighborTiles(center: TileI): TileI[] {
		return center.neighbors;
	}

	#medianCoordinate: Coordinate | null = null;

	/**
	 * Get the approximate middle coordinate of the map.
	 */
	public getMedianCoordinate(forceRenew?: boolean) {
		if (!this.#medianCoordinate || forceRenew) {
			const { x, y, z } = this.#tiles.reduce(
				(totals, tile) => ({
					x: totals.x + tile.x,
					y: totals.y + tile.y,
					z: totals.z + tile.z,
				}),
				{ x: 0, y: 0, z: 0 },
			);
			this.#medianCoordinate = new Coordinate(
				x / this.#tiles.length,
				y / this.#tiles.length,
				z / this.#tiles.length,
			);
		}
		return this.#medianCoordinate;
	}

	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveTerrainJson {
		return {
			tiles: this.#tiles.map((tile) => tile.serializeToSaveJson()),
			size: this.size,
		};
	}
}
