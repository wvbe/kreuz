import { outlineComponent } from '@lib';
import { type locationComponent } from '../ecs/components/locationComponent.ts';
import { type pathableComponent } from '../ecs/components/pathableComponent.ts';
import { EcsEntity } from '../ecs/types.ts';
import { FilterFn } from '../types.ts';
import { type SimpleCoordinate, type TerrainI } from './types.ts';
export type SaveTerrainJson = {
	tiles: Array<{
		center: SimpleCoordinate;
		outline: SimpleCoordinate[];
		ghost: boolean;
	}>;
	size: number;
};
type TileEcs = EcsEntity<
	typeof pathableComponent | typeof locationComponent | typeof outlineComponent
>;

export class Terrain implements TerrainI<TileEcs> {
	readonly #tiles: TileEcs[] = [];

	public readonly size: number;

	constructor(size: number, tiles: TileEcs[]) {
		this.#tiles = tiles;
		this.size = size;
	}

	/**
	 * Array of all tiles that make up this terrain.
	 */
	get tiles(): TileEcs[] {
		return this.#tiles;
	}

	public getTileEqualToLocation(location: SimpleCoordinate, lax?: false): TileEcs;
	public getTileEqualToLocation(location: SimpleCoordinate, lax?: true): TileEcs | null;
	public getTileEqualToLocation(location: SimpleCoordinate, lax?: boolean) {
		const tile = this.#tiles.find((tile) => tile.equalsMapLocation(location)) || null;
		if (!tile && !lax) {
			throw new Error(`No tile matches coordinate ${location} exactly`);
		}
		return tile;
	}

	/**
	 * Array of all tiles that make up this terrain.
	 */
	public selectContiguousTiles(
		start: TileEcs,
		selector: FilterFn<TileEcs> = (tile) => tile.walkability > 0,
		inclusive = true,
	): TileEcs[] {
		const island: TileEcs[] = [];
		const seen: TileEcs[] = [];
		const queue: TileEcs[] = [start];

		while (queue.length) {
			const current = queue.shift() as TileEcs;
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
	public selectClosestTiles(start: SimpleCoordinate, maxDistance: number): TileEcs[] {
		return this.selectContiguousTiles(
			this.getTileClosestToXy(start[0], start[1]),
			(tile) => tile.walkability > 0 && tile.euclideanDistanceTo(start) <= maxDistance,
			false,
		);
	}

	#islands: Map<FilterFn<TileEcs>, TileEcs[][]> = new Map();

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 *
	 * @note Only public for testing purposes.
	 */
	public getIslands(selector: FilterFn<TileEcs> = (tile) => tile.walkability > 0): TileEcs[][] {
		const fromCache = this.#islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.#tiles.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as TileEcs;
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

	/**
	 * Its _possible_ that an entity lives on a tile that has so much elevation that
	 * .getTileClosestToXy actually finds the _wrong_ tile -- because its neighbor is closer than
	 * the proximity to z=0.
	 */
	public getTileClosestToXy(x: number, y: number): TileEcs {
		if (!this.#tiles.length) {
			throw new Error('Terrain is empty');
		}
		let closestDistance = Infinity;
		return this.#tiles.reduce<TileEcs>((last, tile) => {
			const distance = tile.euclideanDistanceTo([x, y, 0]);
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
	public getNeighborTiles(center: TileEcs): TileEcs[] {
		// @TODO not coerce to TileEcs
		return center.pathingNeighbours as TileEcs[];
	}
}
