import { Coordinate } from '../classes/Coordinate.ts';
import { TileI } from '../types.ts';
import { Tile } from './Tile.ts';

export class DualMeshTile extends Tile implements TileI {
	public readonly neighbors: DualMeshTile[] = [];

	constructor(
		x: number,
		y: number,
		z: number,
		points: [number, number][],
		anyPointIsAdjacentToEdge: boolean,
	) {
		super(x, y, z);
		this.addOutlineFromCirculation(points, anyPointIsAdjacentToEdge);
	}

	/**
	 * Designed to be used with the Mesh r_circulate_t() method.
	 */
	private addOutlineFromCirculation(points: [number, number][], anyPointIsAdjacentToEdge: boolean) {
		points.forEach(([x, y]) => {
			this.#outlinePoints.push(new Coordinate(x - this.x, y - this.y, 0));
		});
		this.#isGhost = anyPointIsAdjacentToEdge;
	}
	/**
	 * Contains the coordinates of each polygon node, relative to the XYZ of the tile itself.
	 */
	readonly #outlinePoints: Coordinate[] = [];
	public getOutlineCoordinates() {
		return this.#outlinePoints;
	}

	#isGhost?: boolean;
	#isLand?: boolean = undefined;

	public isLand() {
		if (this.#isLand === undefined) {
			// Return a subset of tiles to reduce "ugly" shapes and the
			this.#isLand =
				// Must be above the waterline:
				this.z >= 0 &&
				// And must be at least <4> neighbors away from an outermost tile
				!(function r(item: DualMeshTile, maxDepth: number): boolean {
					if (item.isAdjacentToEdge()) {
						return true;
					}
					if (maxDepth <= 0) {
						return false;
					}

					--maxDepth;
					return item.neighbors.some((n) => r(n, maxDepth)) || false;
				})(this, 2);
		}
		return this.#isLand;
	}

	public isAdjacentToEdge() {
		return !!this.#isGhost;
	}
}
