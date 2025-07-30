import { SimpleCoordinate } from '../../../terrain/types';

/**
 * Get the euclidian distance between two points in 3D space.
 */
export function getEuclidianDistance(
	[x1, y1, z1]: SimpleCoordinate,
	[x2, y2, z2]: SimpleCoordinate,
) {
	const xy = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
	const xyz = Math.sqrt(xy ** 2 + (z1 - z2) ** 2);
	return xyz;
}
