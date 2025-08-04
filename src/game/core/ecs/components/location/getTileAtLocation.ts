import { QualifiedCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';

/**
 * Gets the tile at a given qualified coordinate location.
 * @param coordinate - A qualified coordinate containing the terrain and position
 * @param lax - If true, will return undefined if no tile exists at the location rather than throwing
 * @returns The tile at the given location, or undefined if lax is true and no tile exists
 */
export function getTileAtLocation(coordinate: QualifiedCoordinate, lax?: false | undefined): Tile;
export function getTileAtLocation(coordinate: QualifiedCoordinate, lax: true): Tile | null;
export function getTileAtLocation(
	[terrain, ...coordinate]: QualifiedCoordinate,
	lax?: boolean,
): Tile | null {
	return terrain.getTileAtMapLocation(
		coordinate,
		//  Fuck you typescript:
		lax as true,
	);
}
