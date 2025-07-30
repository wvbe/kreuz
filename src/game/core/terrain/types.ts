import { Tile } from '../ecs/archetypes/tileArchetype';
import { type Collection } from '../events/Collection';
import { type FilterFn } from '../types';

export type GameDistance = number;

/**
 * A tuple of x, y, z coordinates.
 */
export type SimpleCoordinate = [GameDistance, GameDistance, GameDistance];

export type QualifiedCoordinate = [TerrainI, GameDistance, GameDistance, GameDistance];

/**
 * A landmass or other terrain
 */
export interface TerrainI {
	/**
	 * Size factor, useful for calculating distance. The size factor in the "world" terrain implementation is large,
	 * the size factor of a building terrain implementation would be a fraction of it.
	 */
	sizeMultiplier: number;
	getNeighborTiles(center: Tile): Tile[];
	getTileClosestToXy(x: number, y: number): Tile;
	getTileAtMapLocation(
		location: SimpleCoordinate | QualifiedCoordinate,
		lax?: boolean,
	): Tile | null;
	selectClosestTiles(
		location: SimpleCoordinate | QualifiedCoordinate,
		maxDistance: number,
	): Tile[];
	selectContiguousTiles(start: Tile, selector?: FilterFn<Tile>, inclusive?: boolean): Tile[];
	tiles: Collection<Tile>;

	/**
	 * If this space is contained within another space, this will be the parent space.
	 */
	getParent(): TerrainI | null;
	/**
	 * If this space contains other spaces, this will be the children spaces.
	 */
	children: { location: SimpleCoordinate; terrain: TerrainI }[];
	/**
	 * If an entity travels into this space from the parent, they will arrive to this coordinate. This
	 * is also the coordinate where they exit to the parent from.
	 */
	entryLocation: SimpleCoordinate | null;
	/**
	 * If this space is contained within another space, this will be the ancestors of this space.
	 *
	 * Should return ancestors in order of shallow-to-deep. For example: House, City, Country, World.
	 */
	getAncestors(): TerrainI[];
}
