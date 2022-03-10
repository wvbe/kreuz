import { InGameDistance } from '../constants/perspective';
export interface CoordinateI {
	x: InGameDistance;
	y: InGameDistance;
	z: InGameDistance;
}

export type CoordinateArray = [InGameDistance, InGameDistance, InGameDistance];

export class Coordinate implements CoordinateI {
	x: InGameDistance;
	y: InGameDistance;
	z: InGameDistance;

	constructor(x: InGameDistance, y: InGameDistance, z: InGameDistance) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	equals(coord: CoordinateI) {
		return (
			this === coord ||
			(coord && this.x === coord.x && this.y === coord.y && this.z === coord.z)
		);
	}

	transform(dx: InGameDistance = 0, dy: InGameDistance = 0, dz: InGameDistance = 0) {
		this.x += dx;
		this.y += dy;
		this.z += dz;

		return this;
	}

	hasNaN() {
		return isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
	}

	manhattanDistanceTo(coord: CoordinateI) {
		return Math.abs(this.x - coord.x) + Math.abs(this.y - coord.y) + Math.abs(this.z - coord.z);
	}

	euclideanDistanceTo(coord: CoordinateI) {
		const xy = Math.sqrt((this.x - coord.x) ** 2 + (this.y - coord.y) ** 2);
		const xyz = Math.sqrt(xy ** 2 + (this.z - coord.z) ** 2);
		return xyz;
	}

	// For debugging purposes only, may change without notice or tests
	toString() {
		return [this.x, this.y, this.z].join(',');
	}

	static clone(coord: CoordinateI) {
		return new Coordinate(coord.x, coord.y, coord.z);
	}
}
