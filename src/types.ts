import type Game from './Game.ts';
import { type SaveTerrainJson, type SaveTileJson } from './types-savedgame.ts';

export type GameDistance = number;

/**
 * A function that filters tiles.
 */
export type TileFilter<T extends TileI> = (tile: T) => boolean;

/**
 * A point in space
 */
export interface CoordinateI {
	x: GameDistance;
	y: GameDistance;
	z: GameDistance;
	angleTo(to: CoordinateI): number;
	equals(coord: CoordinateI): boolean;
	euclideanDistanceTo(x: GameDistance, y: GameDistance, z: GameDistance): GameDistance;
	euclideanDistanceTo(coord: CoordinateI): GameDistance;
	hasNaN(): boolean;
	manhattanDistanceTo(coord: CoordinateI): GameDistance;
	toString(): string;
	toArray(): [GameDistance, GameDistance, GameDistance];
	transform(dx: GameDistance, dy: GameDistance, dz: GameDistance): this;
	transform(delta: CoordinateI): this;
	scale(multiplier: number): this;
}

/**
 * A tile
 */
export interface TileI extends CoordinateI {
	terrain?: TerrainI;
	/**
	 * @deprecated Use Terrain.getNeighborTiles instead if you can
	 */
	neighbors: TileI[];
	equals(other: TileI): boolean;
	getOutlineCoordinates(): CoordinateI[];
	isAdjacentToEdge(): boolean;
	isAdjacentToLand(): boolean;
	isLand(): boolean;
	serializeToSaveJson(): SaveTileJson;
}

/**
 * A geographic collection of tiles
 */
export interface TerrainI {
	/**
	 * Array of all tiles that make up this terrain.
	 */
	tiles: TileI[];

	/**
	 * Select all the tiles that are adjacent to the starting tile, so long as they match the
	 * selector.
	 */
	selectContiguousTiles(
		start: TileI,
		selector: TileFilter<TileI>,
		/**
		 * Wether or not the starting tile should be part of the group.
		 */
		inclusive: boolean,
	): TileI[];

	/**
	 * Get the tiles closest to the starting tile (not counting the starting tile itself).
	 */
	selectClosestTiles(start: CoordinateI, maxDistance: number): TileI[];

	/**
	 * Get a list of contigious groups of tiles, aka a list of islands.
	 */
	getIslands(selector: TileFilter<TileI>): TileI[][];

	/**
	 * Get the tile closest to an XY coordinate.
	 */
	getTileClosestToXy(x: number, y: number): TileI;

	/**
	 * Get the tiles that are adjacent to another tile.
	 */
	getNeighborTiles(center: TileI): TileI[];

	getMedianCoordinate(): CoordinateI;

	serializeToSaveJson(): SaveTerrainJson;
}

export type SeedI = string | number;
