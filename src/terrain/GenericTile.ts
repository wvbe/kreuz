import { Coordinate, CoordinateI } from '../classes/Coordinate';
import { TerrainI, TileI } from '../types';

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class GenericTile extends Coordinate implements TileI {
	public terrain?: TerrainI;

	equals(coord: CoordinateI) {
		return this === coord || (coord && this.x === coord.x && this.y === coord.y);
	}

	static clone(coord: TileI) {
		const coord2 = new GenericTile(coord.x, coord.y, coord.z);
		coord2.terrain = coord.terrain;
		return coord2;
	}

	isLand() {
		return this.z >= 0;
	}

	// For debugging purposes only, may change without notice or tests
	toString() {
		return '(' + [this.x, this.y].map((num: number) => num.toFixed(2)).join(',') + ')';
	}

	isAdjacentToEdge(): boolean {
		if (!this.terrain) {
			return false;
		}
		return this.terrain.getNeighborTiles(this).length < 4;
	}
	isAdjacentToLand(): boolean {
		if (!this.terrain) {
			return false;
		}
		return this.terrain.getNeighborTiles(this).some(neighbor => neighbor.isLand());
	}
	getOutlineCoordinates(): Coordinate[] {
		throw new Error('Not implemented');
	}
}
