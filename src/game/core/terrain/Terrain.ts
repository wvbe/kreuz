import { Tile, tileArchetype } from '../ecs/archetypes/tileArchetype';
import { getContiguousObjects } from '../ecs/components/pathingComponent/getContiguousObjects';
import { SurfaceType } from '../ecs/components/surfaceComponent';
import { Collection } from '../events/Collection';
import { FilterFn } from '../types';
import { QualifiedCoordinate, TerrainPortal, type SimpleCoordinate } from './types';
export type SaveTerrainJson = {
	tiles: Array<{
		center: SimpleCoordinate;
		outline: SimpleCoordinate[];
		ghost: boolean;
	}>;
	size: number;
};

export class Terrain {
	/**
	 * If we need to stringify a {@link QualifiedCoordinate}, which includes a reference to the terrain,
	 * it will be useful to have a recognizable identifier.
	 */
	public readonly id: string;

	/**
	 * If this space contains other spaces, this will be the children spaces.
	 */
	public readonly children: TerrainPortal[] = [];
	public readonly tiles = new Collection<Tile>();
	#parent: Terrain | null = null;

	/**
	 * If an entity travels into this terrain from the parent terrain, they will arrive at this
	 *  coordinate. Also, it is where you can exit into the parent from.
	 *
	 * A "portal" is a doorway from the parent terrain into this terrain. The portal's end
	 * is in the destination terrain, whereas the portal's start is in the parent terrain at a
	 * location recorded on the many-to-one relationship ({@link TerrainPortal.portalStart}).
	 *
	 * If this terrain has a parent, travelling from the parent into this terrail will
	 * place you at the end of that portal location.
	 */
	/**
	 *
	 */
	public readonly portalEnd: SimpleCoordinate | null = null;

	/**
	 * Size factor, useful for calculating distance. The size factor in the "world" terrain implementation is large,
	 * the size factor of a building terrain implementation would be a fraction of it.
	 */
	public readonly sizeMultiplier: number;

	public constructor(
		options: {
			id?: string;
			distanceMultiplier?: number;
			parentage?: {
				/**
				 * The beginning of the portal going from the parent into the child, ie. {@link SimpleCoordinate} in the parent terrain
				 */
				portalStart: SimpleCoordinate;
				/**
				 * The parent terrain itself
				 */
				parentTerrain: Terrain;
				/**
				 * The end of the portal going from the parent into the child, ie. {@link SimpleCoordinate} in the current terrain
				 */
				portalEnd: SimpleCoordinate;
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
			this.portalEnd = options.parentage.portalEnd;
			this.#parent = options.parentage.parentTerrain;
			this.#parent.children.push({
				portalStart: options.parentage.portalStart,
				terrain: this,
			});
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

		// Clear the cache of our carefully calculated islands because we've added new tiles
		this.#islands.clear();
	}

	public getPortalToChild(childTerrain: Terrain): TerrainPortal {
		const child = this.children.find((child) => child.terrain === childTerrain);
		if (!child) {
			throw new Error(`Child terrain ${childTerrain.id} not found in ${this.id}`);
		}
		return child;
	}

	public getLocationOfPortalToTerrain(adjacentTerrain: Terrain): SimpleCoordinate {
		if (adjacentTerrain === this.#parent) {
			return this.portalEnd!;
		}
		const portal = this.getPortalToChild(adjacentTerrain);
		return portal.portalStart;
	}

	/**
	 * If this space is contained within another space, this will be the parent space.
	 */
	public getPortalToParent(): TerrainPortal | null {
		if (!this.#parent || !this.portalEnd) {
			return null;
		}

		return {
			// Here's why a child terrain can travel to the parent through only one location:
			portalStart: this.portalEnd,
			terrain: this.#parent,
		};
	}

	/**
	 * If this space is contained within another space, this will be the ancestors of this space.
	 * Does not include itself.
	 *
	 * Should return ancestors in order of shallow-to-deep. For example: House, City, Country, World.
	 */
	public getAncestors(): Terrain[] {
		const ancestors = [];
		let current: TerrainPortal | null = this.getPortalToParent();
		while (current) {
			ancestors.push(current);
			current = current.terrain.getPortalToParent();
		}
		return ancestors.map(({ terrain }) => terrain);
	}

	/**
	 * Returns the parent and child terrains.
	 */
	public getAdjacentTerrains(): TerrainPortal[] {
		return [this.getPortalToParent(), ...this.children].filter((t) => t !== null);
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
	 * Array of all tiles that make up this terrain and which are connected to one another as pathing
	 * neighbours.
	 */
	public selectContiguousTiles(
		start: Tile,
		selector: FilterFn<Tile> = (tile) => tile.walkability > 0,
		inclusive = true,
	): Tile[] {
		return getContiguousObjects(
			start,
			(tile) => tile.pathingNeighbours as Tile[],
			selector,
			inclusive,
		);
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

	public toString() {
		return this.id;
	}
}
