import { type SaveTileJson } from '../types-savedgame.ts';
import { type FilterFn } from '../types.ts';
import { SaveTerrainJson } from './Terrain.ts';

export type GameDistance = number;

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
	// toSaveJson(): SaveTerrainJson;
	tiles: TileGeneric[];
}
