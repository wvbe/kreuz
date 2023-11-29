import { Coordinate } from './Coordinate.ts';
import { CoordinateI, TileI } from '../types.ts';
import { SaveTileJson } from '../types-savedgame.ts';
import { type Terrain } from './Terrain.ts';

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class Tile extends Coordinate implements TileI {
	/**
	 * @deprecated This reference is an anti-pattern
	 */
	public terrain?: Terrain;
	public readonly neighbors: TileI[] = [];

	public equals(coord: CoordinateI): boolean {
		return this === coord || (coord && this.x === coord.x && this.y === coord.y);
	}

	public clone(): Tile {
		return Tile.clone(this);
	}
	/**
	 * @deprecated not currently in use?
	 */
	public static clone(coord: TileI) {
		const coord2 = new Tile(coord.x, coord.y, coord.z);
		coord2.terrain = coord.terrain;
		coord2.neighbors.splice(0, 0, ...coord.neighbors);
		return coord2;
	}

	public isLand() {
		return this.z >= 0;
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
	public toSaveJson(): SaveTileJson {
		return {
			center: this.toArray(),
			outline: this.getOutlineCoordinates().map((coord) => coord.toArray()),
			ghost: false,
		};
	}
}
