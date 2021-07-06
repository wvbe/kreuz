import { CoordinateLike } from '../classes/Coordinate';

//        z+,                height
//        |        __ y+,    depth
//        |     __/
//        |  __/
//    0,0 |_/
//          \__
//             \__
//                \__ x+,    width

const BASE_LENGTH = 32;

export type InGameDistance = number;
export type OnScreenDistance = number;
export type OnSreenAngle = number;

class Perspective {
	public readonly degrees: OnSreenAngle;
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

export const PERSPECTIVE = new Perspective(30, BASE_LENGTH);

export function distanceToCameraComparator(a: CoordinateLike, b: CoordinateLike) {
	const dZ = b.z - a.z;
	if (dZ) {
		return -dZ;
	}
	const dX = b.x - a.x;
	if (dX) {
		return -dX;
	}

	const dY = a.y - b.y;
	if (dY) {
		return -dY;
	}
	return 0;
}
