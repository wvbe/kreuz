import { CoordinateI } from '../classes/Coordinate';

//        z+, height
//        |        __ y+, depth
//        |     __/
//        |  __/
//    0,0 |_/
//          \__
//             \__
//                \__ x+, width

const BASE_LENGTH = 64;

export type InGameDistance = number;
export type OnScreenDistance = number;
export type OnSreenAngle = number;

interface PerspectiveI {
	tileSize: OnScreenDistance;

	toPixels(
		x: InGameDistance,
		y: InGameDistance,
		z: InGameDistance
	): [OnScreenDistance, OnScreenDistance];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class TopDownPerspective implements PerspectiveI {
	tileSize: number = 42;
	constructor(tileSize: OnScreenDistance) {
		this.tileSize = tileSize;
	}
	toPixels(x: number, y: number, z: number): [number, number] {
		return [x * this.tileSize, y * this.tileSize];
	}
}

class IsometricPerspective implements PerspectiveI {
	private readonly degrees: OnSreenAngle;
	public readonly tileSize: OnScreenDistance;

	private _cos: OnSreenAngle;
	private _sin: OnSreenAngle;
	private _tan: OnSreenAngle;

	constructor(degrees: OnSreenAngle, tileSize: OnScreenDistance) {
		this.degrees = degrees;
		this.tileSize = tileSize;

		const isometricAngle = degrees * (Math.PI / 180);
		this._cos = Math.cos(isometricAngle);
		this._sin = Math.sin(isometricAngle);
		this._tan = Math.tan(isometricAngle);
	}

	toPixels(
		x: InGameDistance,
		y: InGameDistance,
		z: InGameDistance
	): [OnScreenDistance, OnScreenDistance] {
		const cartX = (x + y) * this._cos,
			cartY = (x - y) * this._sin;

		const tileHeight = this.tileSize;

		return [
			cartX * this.tileSize, // x
			cartY * this.tileSize - tileHeight * z // y
		];
	}

	private toCoords(
		cartX: InGameDistance,
		cartY: InGameDistance
	): [InGameDistance, InGameDistance, InGameDistance] {
		const isoY = this._tan * cartX + cartY,
			isoX = (cartY - isoY) / -this._sin - isoY;

		// this is good so far, b should be rescaled for tile size. as
		return [isoX / this.tileSize, isoY / this.tileSize, 0];
	}
}

export const perspective = new IsometricPerspective(30, BASE_LENGTH);
// export const PERSPECTIVE = new TopDownPerspective(BASE_LENGTH);

export function distanceToCameraComparator(a: CoordinateI, b: CoordinateI) {
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
