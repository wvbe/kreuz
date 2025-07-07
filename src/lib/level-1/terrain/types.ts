import { type Collection } from '../events/Collection';
import { type FilterFn } from '../types';

export type GameDistance = number;

/**
 * A tuple of x, y, z coordinates.
 */
export type SimpleCoordinate = [GameDistance, GameDistance, GameDistance];

/**
 * A landmass or other terrain
 */
export interface TerrainI<TileGeneric> {
	getNeighborTiles(center: TileGeneric): TileGeneric[];
	getTileClosestToXy(x: number, y: number): TileGeneric;
	getTileEqualToLocation(location: SimpleCoordinate, lax?: boolean): TileGeneric | null;
	selectClosestTiles(start: SimpleCoordinate, maxDistance: number): TileGeneric[];
	selectContiguousTiles(
		start: TileGeneric,
		selector?: FilterFn<TileGeneric>,
		inclusive?: boolean,
	): TileGeneric[];
	tiles: Collection<TileGeneric>;
}
