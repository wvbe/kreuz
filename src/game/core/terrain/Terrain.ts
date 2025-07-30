import { Tile, tileArchetype } from '../ecs/archetypes/tileArchetype';
import { SurfaceType } from '../ecs/components/surfaceComponent';
import { Collection } from '../events/Collection';
import { FilterFn } from '../types';
import { QualifiedCoordinate, type SimpleCoordinate, type TerrainI } from './types';
export type SaveTerrainJson = {
	tiles: Array<{
		center: SimpleCoordinate;
		outline: SimpleCoordinate[];
		ghost: boolean;
	}>;
	size: number;
};

export class Terrain implements TerrainI {
	/**
	 * If we need to stringify a {@link QualifiedCoordinate}, which includes a reference to the terrain,
	 * it will be useful to have a recognizable identifier.
	 */
	public readonly id: string;

	public readonly children: { location: SimpleCoordinate; terrain: TerrainI }[] = [];
	public readonly tiles = new Collection<Tile>();
	#parent: TerrainI | null = null;
	public readonly entryLocation: SimpleCoordinate | null = null;
	public readonly sizeMultiplier: number;

	public constructor(
		options: {
			id?: string;
			distanceMultiplier?: number;
			parentage?: {
				locationInParent: SimpleCoordinate;
				parentTerrain: TerrainI;
				entryLocation: SimpleCoordinate;
			} | null;
			tiles?: {
				location: SimpleCoordinate;
				surfaceType: SurfaceType;
			}[];
		} = {},
	) {
		this.id = options.id ?? Math.random().toString(36).substring(2, 15);
		this.sizeMultiplier = options.distanceMultiplier ?? 1;

		if (options.parentage) {
			this.#parent = options.parentage.parentTerrain;
			this.#parent.children.push({
				location: options.parentage.locationInParent,
				terrain: this,
			});
			this.entryLocation = options.parentage.entryLocation;
		}

		this.addTiles(options.tiles ?? []);
	}

	/**
	 * Creates new tiles into the terrain based on a list of infos given. The created tiles will
	 * have qualified coordinates and pathing neighbours set up.
	 */
	public async addTiles(
		tileInfos: {
			location: SimpleCoordinate;
			surfaceType: SurfaceType;
		}[],
	) {
		const newTiles = tileInfos.map((tileInfo) =>
			tileArchetype.create({
				location: [this, ...tileInfo.location],
				outlineCoordinates: [
					[-0.5, -0.5, 0],
					[0.5, -0.5, 0],
					[0.5, 0.5, 0],
					[-0.5, 0.5, 0],
				],
				surfaceType: tileInfo.surfaceType,
			}),
		);

		await Promise.all(
			newTiles.map(async (tile) => {
				[
					[-1, 0],
					[1, 0],
					[0, 1],
					[0, -1],
				].forEach(([dx, dy]) => {
					const ownLocation = tile.location.get();
					const neighbour = this.getTileAtMapLocation(
						[ownLocation[1] + dx, ownLocation[2] + dy, ownLocation[3]],
						true,
					);
					if (neighbour) {
						tile.pathingNeighbours.push(neighbour);
						neighbour.pathingNeighbours.push(tile);
					}
				});
				return this.tiles.add(tile);
			}),
		);
	}

	public getParent(): TerrainI | null {
		return this.#parent;
	}

	public getAncestors(): TerrainI[] {
		const ancestors = [];
		let current: TerrainI | null = this.getParent();
		while (current) {
			ancestors.push(current);
			current = current.getParent();
		}
		return ancestors;
	}

	/**
	 * Retrieves the tile that exactly matches the given location but ignoring Z (altitude). Unlike {@link getTileClosestToXy},
	 * this method will throw an error (or return null if being lax) if no tile matches the location exactly.
	 *
	 * @param location - The location to match the tile against.
	 * @param lax - Optional. If set to true, allows for lax matching.
	 * @returns The tile that matches the location, or null if no match is found and lax is true.
	 * @throws Error if no tile matches the location exactly and lax is false.
	 */
	public getTileAtMapLocation(
		location: SimpleCoordinate | QualifiedCoordinate,
		lax?: false,
	): Tile;
	public getTileAtMapLocation(
		location: SimpleCoordinate | QualifiedCoordinate,
		lax?: true,
	): Tile | null;
	public getTileAtMapLocation(location: SimpleCoordinate | QualifiedCoordinate, lax?: boolean) {
		if (location.length === 4 && location[0] !== this) {
			if (lax) {
				return null;
			}
			throw new Error('Location is in a different space');
		}
		const qualifiedCoordinate =
			location.length === 4 ? location : ([this, ...location] as QualifiedCoordinate);
		const tile = this.tiles.find((tile) => tile.equalsMapLocation(qualifiedCoordinate)) || null;
		if (!tile && !lax) {
			throw new Error(`No tile matches coordinate ${qualifiedCoordinate} exactly`);
		}
		return tile;
	}

	/**
	 * Array of all tiles that make up this terrain.
	 */
	public selectContiguousTiles(
		start: Tile,
		selector: FilterFn<Tile> = (tile) => tile.walkability > 0,
		inclusive = true,
	): Tile[] {
		const island: Tile[] = [];
		const seen: Tile[] = [];
		const queue: Tile[] = [start];

		while (queue.length) {
			const current = queue.shift() as Tile;
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
	public selectClosestTiles(
		location: SimpleCoordinate | QualifiedCoordinate,
		maxDistance: number,
	): Tile[] {
		const qualifiedCoordinate =
			location.length === 4 ? location : ([this, ...location] as QualifiedCoordinate);
		return this.selectContiguousTiles(
			this.getTileClosestToXy(qualifiedCoordinate[1], qualifiedCoordinate[2]),
			(tile) =>
				tile.walkability > 0 &&
				tile.euclideanDistanceTo(qualifiedCoordinate) <= maxDistance,
			false,
		);
	}

	#islands: Map<FilterFn<Tile>, Tile[][]> = new Map();

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 *
	 * @note Only public for testing purposes.
	 */
	public getIslands(selector: FilterFn<Tile> = (tile) => tile.walkability > 0): Tile[][] {
		const fromCache = this.#islands.get(selector);
		if (fromCache) {
			return fromCache;
		}

		let open = this.tiles.slice();
		const islands = [];
		while (open.length) {
			const next = open.shift() as Tile;
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
	 * Returns the tile closest to the given x,y,z coordinates. Unlike {@link getTileAtMapLocation}
	 * this method will always come up with a tile, which may have different coordinates altogether.
	 *
	 * May also return an unexpected tile if the tile at the requested XY has so much Z that one of its
	 * neighbors is actually closer..
	 */
	public getTileClosestToXy(x: number, y: number): Tile {
		if (!this.tiles.length) {
			throw new Error('Terrain is empty');
		}
		let closestDistance = Infinity;
		return this.tiles.reduce<Tile>((last, tile) => {
			const distance = tile.euclideanDistanceTo([this, x, y, 0]);
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
	public getNeighborTiles(center: Tile): Tile[] {
		// @TODO not coerce to TileEcs
		return center.pathingNeighbours as Tile[];
	}

	public toString() {
		return this.id;
	}
}
