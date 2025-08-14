import { getFenceCoordinatesForTiles } from './getFenceCoordinatesForTiles';
import { SimpleCoordinate } from './types';

describe('getFenceCoordinatesForTiles', () => {
	describe('empty input', () => {
		it('should return empty array for no tiles', () => {
			const result = getFenceCoordinatesForTiles([]);
			expect(result).toEqual([]);
		});
	});

	describe('single tile', () => {
		it('should create a square fence around a single tile', () => {
			const tiles: SimpleCoordinate[] = [[0, 0, 0]];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should have 4 vertices forming a square
			expect(result).toHaveLength(4);

			// The vertices should form a square around the tile at (0,0)
			const expectedVertices = [
				[-0.5, -0.5, 0],
				[0.5, -0.5, 0],
				[0.5, 0.5, 0],
				[-0.5, 0.5, 0],
			];

			// Check that all expected vertices are present (order may vary)
			for (const expected of expectedVertices) {
				expect(result).toContainEqual(expected);
			}
		});
	});

	describe('two adjacent tiles', () => {
		it('should create a rectangular fence around two horizontally adjacent tiles', () => {
			const tiles: SimpleCoordinate[] = [
				[0, 0, 0],
				[1, 0, 0],
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should form a rectangle around both tiles
			const expectedVertices = [
				[-0.5, -0.5, 0], // Bottom-left of first tile
				[1.5, -0.5, 0], // Bottom-right of second tile
				[1.5, 0.5, 0], // Top-right of second tile
				[-0.5, 0.5, 0], // Top-left of first tile
			];

			expect(result).toHaveLength(4);
			for (const expected of expectedVertices) {
				expect(result).toContainEqual(expected);
			}
		});

		it('should create a rectangular fence around two vertically adjacent tiles', () => {
			const tiles: SimpleCoordinate[] = [
				[0, 0, 0],
				[0, 1, 0],
			];
			const result = getFenceCoordinatesForTiles(tiles);

			const expectedVertices = [
				[-0.5, -0.5, 0], // Bottom-left of first tile
				[0.5, -0.5, 0], // Bottom-right of first tile
				[0.5, 1.5, 0], // Top-right of second tile
				[-0.5, 1.5, 0], // Top-left of second tile
			];

			expect(result).toHaveLength(4);
			for (const expected of expectedVertices) {
				expect(result).toContainEqual(expected);
			}
		});
	});

	describe('2x2 square of tiles', () => {
		it('should create a square fence around a 2x2 group', () => {
			const tiles: SimpleCoordinate[] = [
				[0, 0, 0],
				[0, 1, 0],
				[1, 0, 0],
				[1, 1, 0],
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should form a 2x2 square perimeter
			const expectedVertices = [
				[-0.5, -0.5, 0], // Bottom-left
				[1.5, -0.5, 0], // Bottom-right
				[1.5, 1.5, 0], // Top-right
				[-0.5, 1.5, 0], // Top-left
			];

			expect(result).toHaveLength(4);
			for (const expected of expectedVertices) {
				expect(result).toContainEqual(expected);
			}
		});
	});

	describe('L-shaped group', () => {
		it('should create a fence around an L-shaped group of tiles', () => {
			const tiles: SimpleCoordinate[] = [
				[0, 0, 0], // Bottom of L
				[0, 1, 0], // Middle of L
				[1, 1, 0], // Top-right of L
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should create an L-shaped perimeter with 6 vertices
			expect(result.length).toBeGreaterThanOrEqual(6);

			// Check some key vertices that should be present
			const keyVertices = [
				[-0.5, -0.5, 0], // Bottom-left of bottom tile
				[0.5, -0.5, 0], // Bottom-right of bottom tile
				[0.5, 0.5, 0], // Inner corner of L
				[1.5, 0.5, 0], // Right edge
				[1.5, 1.5, 0], // Top-right
				[-0.5, 1.5, 0], // Top-left
			];

			for (const vertex of keyVertices) {
				expect(result).toContainEqual(vertex);
			}
		});
	});

	describe('multiple separate islands', () => {
		it('should create separate fences for disconnected tile groups', () => {
			const tiles: SimpleCoordinate[] = [
				// First island
				[0, 0, 0],
				[1, 0, 0],
				// Second island (separated by gap)
				[3, 0, 0],
				[4, 0, 0],
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should have vertices for both islands
			expect(result.length).toBeGreaterThanOrEqual(8); // At least 4 vertices per island

			// Check vertices for first island
			const firstIslandVertices = [
				[-0.5, -0.5, 0],
				[1.5, -0.5, 0],
				[1.5, 0.5, 0],
				[-0.5, 0.5, 0],
			];

			// Check vertices for second island
			const secondIslandVertices = [
				[2.5, -0.5, 0],
				[4.5, -0.5, 0],
				[4.5, 0.5, 0],
				[2.5, 0.5, 0],
			];

			for (const vertex of [...firstIslandVertices, ...secondIslandVertices]) {
				expect(result).toContainEqual(vertex);
			}
		});
	});

	describe('different Z levels', () => {
		it('should handle tiles at different Z levels as separate islands', () => {
			const tiles: SimpleCoordinate[] = [
				[0, 0, 0], // Ground level
				[0, 0, 1], // Upper level (same X,Y but different Z)
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should create separate fences for each Z level
			expect(result.length).toBe(8); // 4 vertices per tile since they're not contiguous

			// Ground level vertices
			const groundVertices = [
				[-0.5, -0.5, 0],
				[0.5, -0.5, 0],
				[0.5, 0.5, 0],
				[-0.5, 0.5, 0],
			];

			// Upper level vertices
			const upperVertices = [
				[-0.5, -0.5, 1],
				[0.5, -0.5, 1],
				[0.5, 0.5, 1],
				[-0.5, 0.5, 1],
			];

			for (const vertex of [...groundVertices, ...upperVertices]) {
				expect(result).toContainEqual(vertex);
			}
		});
	});

	describe('complex shapes', () => {
		it('should handle a plus-shaped group', () => {
			const tiles: SimpleCoordinate[] = [
				[1, 0, 0], // Bottom of plus
				[0, 1, 0], // Left of plus
				[1, 1, 0], // Center of plus
				[2, 1, 0], // Right of plus
				[1, 2, 0], // Top of plus
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Plus shape should have 12 vertices around its perimeter
			expect(result.length).toBe(12);

			// Check some key outer vertices
			const keyVertices = [
				[0.5, -0.5, 0], // Bottom-right of bottom arm
				[1.5, -0.5, 0], // Bottom-left of bottom arm
				[2.5, 0.5, 0], // Right edge of right arm
				[2.5, 1.5, 0], // Right edge of right arm
				[1.5, 2.5, 0], // Top edge of top arm
				[0.5, 2.5, 0], // Top edge of top arm
				[-0.5, 1.5, 0], // Left edge of left arm
				[-0.5, 0.5, 0], // Left edge of left arm
			];

			for (const vertex of keyVertices) {
				expect(result).toContainEqual(vertex);
			}
		});
	});

	describe('edge cases', () => {
		it('should handle tiles with non-integer coordinates', () => {
			const tiles: SimpleCoordinate[] = [
				[0.5, 0.5, 0],
				[1.5, 0.5, 0],
			];
			const result = getFenceCoordinatesForTiles(tiles);

			// Should create fence around the two tiles with decimal coordinates
			const expectedVertices = [
				[0, 0, 0], // Bottom-left
				[2, 0, 0], // Bottom-right
				[2, 1, 0], // Top-right
				[0, 1, 0], // Top-left
			];

			expect(result).toHaveLength(4);
			for (const expected of expectedVertices) {
				expect(result).toContainEqual(expected);
			}
		});

		it('should handle negative coordinates', () => {
			const tiles: SimpleCoordinate[] = [
				[-1, -1, 0],
				[-1, 0, 0],
			];
			const result = getFenceCoordinatesForTiles(tiles);

			const expectedVertices = [
				[-1.5, -1.5, 0], // Bottom-left
				[-0.5, -1.5, 0], // Bottom-right
				[-0.5, 0.5, 0], // Top-right
				[-1.5, 0.5, 0], // Top-left
			];

			expect(result).toHaveLength(4);
			for (const expected of expectedVertices) {
				expect(result).toContainEqual(expected);
			}
		});
	});
});
