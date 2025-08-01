import { SimpleCoordinate } from '../../../terrain/types';

/**
 * Get the euclidean distance between two points in 2D space. The "Z" (height) coordinates are ignored
 */
export function getEuclideanMapDistance([x1, y1]: SimpleCoordinate, [x2, y2]: SimpleCoordinate) {
	const xy = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	// const xyz = Math.sqrt(xy ** 2 + (z1 - z2) ** 2);
	return xy;
}
