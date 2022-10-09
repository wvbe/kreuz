import { Coordinate } from '../classes/Coordinate.ts';
import { CoordinateI, TerrainI, TileI } from '../types.ts';
import { SaveTileJson } from '../types-savedgame.ts';

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class Tile extends Coordinate implements TileI {
	public terrain?: TerrainI;
	public readonly neighbors: Tile[] = [];

	public equals(coord: CoordinateI): boolean {
		return this === coord || (coord && this.x === coord.x && this.y === coord.y);
	}

	/**
	 * @deprecated not currently in use?
	 */
	public static clone(coord: TileI) {
		const coord2 = new Tile(coord.x, coord.y, coord.z);
		coord2.terrain = coord.terrain;
		return coord2;
	}

	public isLand() {
		return this.z >= 0;
	}

	// For debugging purposes only, may change without notice or tests
	public toString() {
		return '(' + [this.x, this.y].map((num: number) => num.toFixed(2)).join(',') + ')';
	}

	public isAdjacentToLand() {
		return this.neighbors.some((n) => n.isLand());
	}

	isAdjacentToEdge(): boolean {
		throw new Error('Not implemented');
	}

	getOutlineCoordinates(): CoordinateI[] {
		throw new Error('Not implemented');
	}
	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveTileJson {
		return {
			center: this.toArray(),
			outline: this.getOutlineCoordinates().map((coord) => coord.toArray()),
		};
	}
}
