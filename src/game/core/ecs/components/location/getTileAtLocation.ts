import { QualifiedCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';

export function getTileAtLocation([terrain, ...coordinate]: QualifiedCoordinate): Tile {
	return terrain.getTileAtMapLocation(coordinate, false);
}
