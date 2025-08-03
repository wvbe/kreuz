import { Terrain } from './Terrain';

export type GameDistance = number;

/**
 * A tuple of [x, y, z] coordinates for horizontal, vertical on a grid and (unused) altitude.
 */
export type SimpleCoordinate = [GameDistance, GameDistance, GameDistance];

/**
 * The same as {@link SimpleCoordinate}, but includes a reference to the {@link Terrain} these
 * tiles are in.
 * - Entities can find paths between all different terrains via portals, because all terrains
 * are in a tree structure with {@link Game.terrains} at the root.
 */
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
