import { expect, it, describe, run } from 'tincan';
import { SquareTile } from './SquareTile.ts';

describe('SquareTile', () => {
	it('should return true if the tile is adjacent to an edge', () => {
		const tile = new SquareTile(0, 0, 0);
		tile.neighbors.push(new SquareTile(0, 0, 0));
		tile.neighbors.push(new SquareTile(0, 0, 0));
		tile.neighbors.push(new SquareTile(0, 0, 0));
		expect(tile.isAdjacentToEdge()).toBe(true);
	});

	it('should return false if the tile is not adjacent to an edge', () => {
		const tile = new SquareTile(0, 0, 0);
		new SquareTile(0, 0, 0);
		new SquareTile(0, 0, 0);
		new SquareTile(0, 0, 0);
		new SquareTile(0, 0, 0);
		expect(tile.isAdjacentToEdge()).toBe(false);
	});

	it('should return the outline coordinates of the tile', () => {
		const tile = new SquareTile(0, 0, 0);
		const expectedCoordinates = [
			{ x: -0.5, y: -0.5, z: 0 },
			{ x: 0.5, y: -0.5, z: 0 },
			{ x: 0.5, y: 0.5, z: 0 },
			{ x: -0.5, y: 0.5, z: 0 },
		];
		expect(tile.getOutlineCoordinates()).toEqual(expectedCoordinates);
	});
});
