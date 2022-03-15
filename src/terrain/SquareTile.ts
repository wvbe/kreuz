import { CoordinateI, TileI } from '../types';
import { Tile } from './Tile';

/**
 * A special type of coordinate that is equal to another terrain coordinate when the X and Y are equal, disregarding Z.
 */
export class SquareTile extends Tile implements TileI {
	isAdjacentToEdge(): boolean {
		return this.neighbors.length < 4;
	}

	getOutlineCoordinates(): CoordinateI[] {
		throw new Error('Not implemented');
	}
}
