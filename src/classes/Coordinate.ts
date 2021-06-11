import { CoordValue, Length } from '../space/PERSPECTIVE';
export interface CoordinateLike {
	x: CoordValue;
	y: CoordValue;
	z: CoordValue;
}

export class Coordinate implements CoordinateLike {
	x: CoordValue;
	y: CoordValue;
	z: CoordValue;

	constructor(x: CoordValue, y: CoordValue, z: CoordValue) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	equals(coord: CoordinateLike) {
		return (
			this === coord ||
			(coord && this.x === coord.x && this.y === coord.y && this.z === coord.z)
		);
	}

	transform(dx: Length = 0, dy: Length = 0, dz: Length = 0) {
		this.x += dx;
		this.y += dy;
		this.z += dz;

		return this;
	}

	hasNaN() {
		return isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
	}

	manhattanDistanceTo(coord: CoordinateLike) {
		return Math.abs(this.x - coord.x) + Math.abs(this.y - coord.y) + Math.abs(this.z - coord.z);
	}

	euclideanDistanceTo(coord: CoordinateLike) {
		const xy = Math.sqrt((this.x - coord.x) ** 2 + (this.y - coord.y) ** 2);
		const xyz = Math.sqrt(xy ** 2 + (this.z - coord.z) ** 2);
		return xyz;
	}

	// For debugging purposes only, may change without notice or tests
	toString() {
		return [this.x, this.y, this.z].join(',');
	}

	static clone(coord: CoordinateLike) {
		return new Coordinate(coord.x, coord.y, coord.z);
	}
}
