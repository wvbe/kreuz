import { QualifiedCoordinate } from '../../../game/core/terrain/types';

/**
 * For a given rectangle by its top-left and bottom-right coordinates, return all the {@link QualifiedCoordinate}s
 * that are within the rectangle.
 */
export function getTileCoordinatesInRectangle(
	topLeft: QualifiedCoordinate,
	bottomRight: QualifiedCoordinate,
) {
	const tiles: QualifiedCoordinate[] = [];

	const [startTerrain, startX, startY] = topLeft,
		[_endTerrain, endX, endY] = bottomRight;

	for (let x = Math.round(Math.min(startX, endX)); x <= Math.round(Math.max(startX, endX)); x++) {
		for (
			let y = Math.round(Math.min(startY, endY));
			y <= Math.round(Math.max(startY, endY));
			y++
		) {
			tiles.push([startTerrain, Math.round(x), Math.round(y), 0]);
		}
	}

	return tiles;
}
