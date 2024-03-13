import { expect, it, describe, run } from '@test';
import { Tile } from './Tile.ts';

describe('Tile', () => {
	it('should return true if the tile is land', () => {
		const tile = new Tile(0, 0, 1);
		expect(tile.isLand()).toBe(true);
	});

	it('should return false if the tile is not land', () => {
		const tile = new Tile(0, 0, -1);
		expect(tile.isLand()).toBe(false);
	});

	it('should return true if the tile is adjacent to land', () => {
		const tile1 = new Tile(0, 0, 1);
		const tile2 = new Tile(1, 0, 0);
		tile1.neighbors.push(tile2);
		expect(tile1.isAdjacentToLand()).toBe(true);
	});

	it('should return false if the tile is not adjacent to land', () => {
		const tile1 = new Tile(0, 0, -1);
		const tile2 = new Tile(1, 0, -1);
		tile1.neighbors.push(tile2);
		expect(tile1.isAdjacentToLand()).toBe(false);
	});
});

run();
