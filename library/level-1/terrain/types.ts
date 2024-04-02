import { type SaveTileJson } from '../types-savedgame.ts';
import { type FilterFn } from '../types.ts';
import { SaveTerrainJson } from './Terrain.ts';

export type GameDistance = number;

export type SimpleCoordinate = [GameDistance, GameDistance, GameDistance];

/**
 * A point in space
 *
 * @note Interestingly this type is barely used outside the level 1 library.
 */
export interface CoordinateI {
	x: GameDistance;
	y: GameDistance;
	z: GameDistance;
	equals(coord: CoordinateI): boolean;
	euclideanDistanceTo(x: GameDistance, y: GameDistance, z: GameDistance): GameDistance;
	euclideanDistanceTo(coord: CoordinateI): GameDistance;
	manhattanDistanceTo(coord: CoordinateI): GameDistance;
	toArray(): SimpleCoordinate;
	transform(dx: GameDistance, dy: GameDistance, dz: GameDistance): this;
	transform(delta: CoordinateI): this;
	clone(): CoordinateI;
}

/**
 * A tile
 *
 * @note Interestingly this type is barely used outside the level 1 library.
 */
export interface TileI extends CoordinateI {
	/**
	 * @deprecated This reference is an anti-pattern
	 */
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
	toSaveJson(): SaveTileJson;
}

/**
 * A landmass or other terrain
 */
export interface TerrainI {
	getNeighborTiles(center: TileI): TileI[];
	getTileClosestToXy(x: number, y: number): TileI;
	getTileEqualToLocation(location: CoordinateI, lax?: boolean): TileI | null;
	selectClosestTiles(start: CoordinateI, maxDistance: number): TileI[];
	selectContiguousTiles(start: TileI, selector: FilterFn<TileI>, inclusive: boolean): TileI[];
	toSaveJson(): SaveTerrainJson;
	tiles: TileI[];
}
