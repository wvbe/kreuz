import { CoordinateI, InGameDistance } from '../types';

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

	equals(coord: CoordinateI): boolean {
		return (
			this === coord ||
			(coord && this.x === coord.x && this.y === coord.y && this.z === coord.z)
		);
	}

	transform(dx: InGameDistance, dy: InGameDistance, dz: InGameDistance): this;
	transform(delta: CoordinateI): this;
	transform(
		dxOrDelta: InGameDistance | CoordinateI,
		dy?: InGameDistance,
		dz?: InGameDistance
	): this {
		if (typeof dxOrDelta === 'number' && dy !== undefined && dz !== undefined) {
			this.x += dxOrDelta;
			this.y += dy;
			this.z += dz;
		} else {
			const delta = dxOrDelta as CoordinateI;
			this.x += delta.x;
			this.y += delta.y;
			this.z += delta.z;
		}
		return this;
	}
	scale(r: number) {
		this.x *= r;
		this.y *= r;
		this.z *= r;

		return this;
	}

	hasNaN() {
		return isNaN(this.x) || isNaN(this.y) || isNaN(this.z);
	}

	manhattanDistanceTo(coord: CoordinateI) {
		return Math.abs(this.x - coord.x) + Math.abs(this.y - coord.y) + Math.abs(this.z - coord.z);
	}

	euclideanDistanceTo(x: number, y: number, z: number): number;
	euclideanDistanceTo(coord: CoordinateI): number;
	euclideanDistanceTo(x: number | CoordinateI, y?: number, z?: number) {
		if (typeof x === 'object') {
			y = x.y;
			z = x.z;
			x = x.x;
		}
		if (y === undefined || z === undefined) {
			throw new Error();
		}
		const xy = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2);
		const xyz = Math.sqrt(xy ** 2 + (this.z - z) ** 2);
		return xyz;
	}

	angleTo(to: CoordinateI) {
		// https://www.cimt.org.uk/projects/mepres/step-up/sect4/ratbig.gif
		// https://meneerriksen.nl/onewebmedia/Wiskunde%20LJ2p4%20Goniometrie%20oefeningen.pages.pdf
		const adjacent = to.x - this.x;
		const opposite = to.y - this.y;
		let angle = Math.atan(opposite / adjacent);
		if (opposite < 0 && adjacent < 0) {
			// The bottom left quadrant
			return Math.PI + Math.abs(angle);
		} else if (opposite < 0) {
			// The bottom right quadrant
			return 2 * Math.PI - Math.abs(angle);
		} else if (adjacent < 0) {
			// The top left quadrant
			return angle + Math.PI;
		} else {
			return angle;
		}
	}
	// For debugging purposes only, may change without notice or tests
	toString() {
		return [this.x, this.y, this.z].join(',');
	}

	static clone(coord: CoordinateI) {
		return new Coordinate(coord.x, coord.y, coord.z);
	}

	static transform(coord1: CoordinateI, coord2: CoordinateI) {
		return new Coordinate(coord1.x + coord2.x, coord1.y + coord2.y, coord1.z + coord2.z);
	}

	static difference(coord1: CoordinateI, coord2: CoordinateI) {
		return new Coordinate(coord1.x - coord2.x, coord1.y - coord2.y, coord1.z - coord2.z);
	}
}
