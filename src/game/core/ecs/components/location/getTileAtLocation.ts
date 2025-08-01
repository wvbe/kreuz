import { QualifiedCoordinate } from '../../../terrain/types';
import { Tile } from '../../archetypes/tileArchetype';

export function getTileAtLocation([terrain, ...coordinate]: QualifiedCoordinate): Tile {
	const tile = terrain.getTileAtMapLocation(coordinate);
	if (!tile) {
		throw new Error(`Tile not found at location ${coordinate.join('/')}`);
	}
	return tile;
}
