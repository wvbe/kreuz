import { type locationComponent } from '../ecs/components/locationComponent';
import { type pathableComponent } from '../ecs/components/pathableComponent';
import { EcsEntity } from '../ecs/types';
import { Collection } from '../events/Collection';
import { FilterFn } from '../types';
import { type SimpleCoordinate, type TerrainI } from './types';
export type SaveTerrainJson = {
	tiles: Array<{
		center: SimpleCoordinate;
		outline: SimpleCoordinate[];
		ghost: boolean;
	}>;
	size: number;
};

export class Terrain<
	TileGeneric extends EcsEntity<typeof pathableComponent | typeof locationComponent>,
> implements TerrainI<TileGeneric>
{
	public readonly tiles: Collection<TileGeneric>;

	public constructor(tiles: TileGeneric[] | Collection<TileGeneric>) {
		if (tiles instanceof Collection) {
			this.tiles = tiles;
		} else {
			this.tiles = new Collection();
			this.tiles.add(...tiles);
		}
	}

	public getTileEqualToLocation(location: SimpleCoordinate, lax?: false): TileGeneric;
	public getTileEqualToLocation(location: SimpleCoordinate, lax?: true): TileGeneric | null;

	/**
	 * Retrieves the tile that matches the given location.
	 *
	 * @param location - The location to match the tile against.
	 * @param lax - Optional. If set to true, allows for lax matching.
	 * @returns The tile that matches the location, or null if no match is found and lax is true.
	 * @throws Error if no tile matches the location exactly and lax is false.
	 */
	public getTileEqualToLocation(location: SimpleCoordinate, lax?: boolean) {
		const tile = this.tiles.find((tile) => tile.equalsMapLocation(location)) || null;
		if (!tile && !lax) {
			throw new Error(`No tile matches coordinate ${location} exactly`);
		}
		return tile;
	}

	/**
	 * Array of all tiles that make up this terrain.
	 */
	public selectContiguousTiles(
		start: TileGeneric,
		selector: FilterFn<TileGeneric> = (tile) => tile.walkability > 0,
		inclusive = true,
	): TileGeneric[] {
		const island: TileGeneric[] = [];
		const seen: TileGeneric[] = [];
		const queue: TileGeneric[] = [start];

		while (queue.length) {
			const current = queue.shift() as TileGeneric;
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
	public selectClosestTiles(start: SimpleCoordinate, maxDistance: number): TileGeneric[] {
		return this.selectContiguousTiles(
			this.getTileClosestToXy(start[0], start[1]),
			(tile) => tile.walkability > 0 && tile.euclideanDistanceTo(start) <= maxDistance,
			false,
		);
	}

	#islands: Map<FilterFn<TileGeneric>, TileGeneric[][]> = new Map();

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 *
	 * @note Only public for testing purposes.
	 */
	public getIslands(
		selector: FilterFn<TileGeneric> = (tile) => tile.walkability > 0,
	): TileGeneric[][] {
		const fromCache = this.#islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.tiles.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as TileGeneric;
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
	public getTileClosestToXy(x: number, y: number): TileGeneric {
		if (!this.tiles.length) {
			throw new Error('Terrain is empty');
		}
		let closestDistance = Infinity;
		return this.tiles.reduce<TileGeneric>((last, tile) => {
			const distance = tile.euclideanDistanceTo([x, y, 0]);
			if (distance < closestDistance) {
				closestDistance = distance;
				return tile;
			} else {
				return last;
			}
		}, this.tiles.get(0));
	}

	/**
	 * Get the tiles that are adjacent to another tile.
	 */
	public getNeighborTiles(center: TileGeneric): TileGeneric[] {
		// @TODO not coerce to TileEcs
		return center.pathingNeighbours as TileGeneric[];
	}
}
