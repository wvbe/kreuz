import { QualifiedCoordinate, SimpleCoordinate } from '../../../terrain/types';

export function isMapLocationEqualTo(location: SimpleCoordinate, other: SimpleCoordinate): boolean;
export function isMapLocationEqualTo(
	location: QualifiedCoordinate,
	other: QualifiedCoordinate,
): boolean;
export function isMapLocationEqualTo(
	location: QualifiedCoordinate | SimpleCoordinate,
	other: QualifiedCoordinate | SimpleCoordinate,
) {
	if (location.length !== other.length) {
		throw new Error('Coordinate types are not the same');
	}
	if (location.length === 4) {
		const [space1, x1, y1] = location;
		const [space2, x2, y2] = other;
		return space1 === space2 && x1 === x2 && y1 === y2;
	}
	if (location.length === 3) {
		const [x1, y1] = location;
		const [x2, y2] = other;
		return x1 === x2 && y1 === y2;
	}
	throw new Error('Coordinate types is not supported');
}
