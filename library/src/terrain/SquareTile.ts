import { Coordinate } from './Coordinate.ts';
import { CoordinateI, TileI } from '../types.ts';
import { Tile } from './Tile.ts';

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class SquareTile extends Tile implements TileI {
	isAdjacentToEdge(): boolean {
		return this.neighbors.length < 4;
	}

	getOutlineCoordinates(): CoordinateI[] {
		return [
			[-0.5, -0.5],
			[0.5, -0.5],
			[0.5, 0.5],
			[-0.5, 0.5],
		].map(([x, y]) => new Coordinate(x, y, 0));
	}
}
