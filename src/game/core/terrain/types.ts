import { Terrain } from './Terrain';

export type GameDistance = number;

/**
 * A tuple of x, y, z coordinates.
 */
export type SimpleCoordinate = [GameDistance, GameDistance, GameDistance];

export type QualifiedCoordinate = [Terrain, GameDistance, GameDistance, GameDistance];

/**
 * A reference to a terrain from (a location in) another terrain.
 */
export type TerrainPortal = {
	/**
	 * The start of the doorway to this terrain, lives in the parent terrain
	 */
	portalStart: SimpleCoordinate;
	/**
	 * The terrain this portal leads to.
	 */
	terrain: Terrain;
};
