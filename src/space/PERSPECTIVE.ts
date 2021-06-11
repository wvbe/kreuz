import { CoordinateLike } from '../classes/Coordinate';
//     z+
//     |     y+
//     |    /
//     |  /
//     |/
// 0,0  \
//        \
//          \ x+

const BASE_LENGTH = 32;

export type CoordValue = number;
export type Length = number;
export type Angle = number;
export type CoordArray = [CoordValue, CoordValue, CoordValue];
export type CoordObject = { x: CoordValue; y: CoordValue; z: CoordValue };

function createPerspective(degrees: Angle, tileSize: Length) {
	const isometricAngle = degrees * (Math.PI / 180);
	const _isometricCos = Math.cos(isometricAngle);
	const _isometricSin = Math.sin(isometricAngle);
	const _isometricTan = Math.tan(isometricAngle);

	const tileHeight = tileSize;

	return {
		degrees: degrees,
		radians: degrees * (Math.PI / 180),
		tileSize: tileSize,
		toPixels: (x: CoordValue, y: CoordValue, z: CoordValue) => {
			const cartX = (x + y) * _isometricCos,
				cartY = (x - y) * _isometricSin;

			return [
				cartX * tileSize, // x
				cartY * tileSize - tileHeight * z // y
			];
		},
		toCoords: (cartX: CoordValue, cartY: CoordValue) => {
			const isoY = _isometricTan * cartX + cartY,
				isoX = (cartY - isoY) / -_isometricSin - isoY;

			// this is good so far, b should be rescaled for tile size. as
			return [isoX / tileSize, isoY / tileSize];
		}
	};
}

export const PERSPECTIVE = createPerspective(30, BASE_LENGTH);

export function randomComparator() {
	return 0.5 - Math.random();
}

export function distanceToCameraComparator(a: CoordinateLike, b: CoordinateLike) {
	const dX = b.x - a.x;
	if (dX) {
		return -dX;
	}

	const dY = a.y - b.y;
	if (dY) {
		return -dY;
	}
	const dZ = b.z - a.z;
	if (dZ) {
		return -dZ;
	}
	return 0;
}
