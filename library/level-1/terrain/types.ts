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
 * A landmass or other terrain
 */
export interface TerrainI<TileGeneric> {
	getNeighborTiles(center: TileGeneric): TileGeneric[];
	getTileClosestToXy(x: number, y: number): TileGeneric;
	getTileEqualToLocation(location: CoordinateI, lax?: boolean): TileGeneric | null;
	selectClosestTiles(start: CoordinateI, maxDistance: number): TileGeneric[];
	selectContiguousTiles(
		start: TileGeneric,
		selector?: FilterFn<TileGeneric>,
		inclusive?: boolean,
	): TileGeneric[];
	// toSaveJson(): SaveTerrainJson;
	tiles: TileGeneric[];
}
