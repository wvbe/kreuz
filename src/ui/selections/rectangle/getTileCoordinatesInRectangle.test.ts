import { Terrain } from '../../../game/core/terrain/Terrain';
import { QualifiedCoordinate } from '../../../game/core/terrain/types';
import { getTileCoordinatesInRectangle } from './getTileCoordinatesInRectangle';

describe('getTileCoordinatesInRectangle', () => {
	let mockTerrain: Terrain;

	beforeEach(() => {
		// Create a mock terrain for testing
		mockTerrain = {} as Terrain;
	});

	it('should return a single tile when topLeft and bottomRight are the same', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, 5, 5, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 5, 5, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		expect(result).toEqual([[mockTerrain, 5, 5, 0]]);
	});

	it('should return all tiles in a 2x2 rectangle', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, 0, 0, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 1, 1, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		expect(result).toHaveLength(4);
		expect(result).toEqual(
			expect.arrayContaining([
				[mockTerrain, 0, 0, 0],
				[mockTerrain, 0, 1, 0],
				[mockTerrain, 1, 0, 0],
				[mockTerrain, 1, 1, 0],
			]),
		);
	});

	it('should return all tiles in a 3x2 rectangle', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, 2, 3, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 4, 4, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		expect(result).toHaveLength(6);
		expect(result).toEqual(
			expect.arrayContaining([
				[mockTerrain, 2, 3, 0],
				[mockTerrain, 2, 4, 0],
				[mockTerrain, 3, 3, 0],
				[mockTerrain, 3, 4, 0],
				[mockTerrain, 4, 3, 0],
				[mockTerrain, 4, 4, 0],
			]),
		);
	});

	it('should handle coordinates when topLeft is actually bottom-right', () => {
		// Test that the function handles coordinate order correctly
		const topLeft: QualifiedCoordinate = [mockTerrain, 3, 3, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 1, 1, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		expect(result).toHaveLength(9);
		expect(result).toEqual(
			expect.arrayContaining([
				[mockTerrain, 1, 1, 0],
				[mockTerrain, 1, 2, 0],
				[mockTerrain, 1, 3, 0],
				[mockTerrain, 2, 1, 0],
				[mockTerrain, 2, 2, 0],
				[mockTerrain, 2, 3, 0],
				[mockTerrain, 3, 1, 0],
				[mockTerrain, 3, 2, 0],
				[mockTerrain, 3, 3, 0],
			]),
		);
	});

	it('should round fractional coordinates', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, 1.4, 2.6, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 2.7, 3.3, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		// 1.4 rounds to 1, 2.7 rounds to 3 (x: 1-3 = 3 tiles)
		// 2.6 rounds to 3, 3.3 rounds to 3 (y: 3-3 = 1 tile)
		expect(result).toHaveLength(3);
		expect(result).toEqual(
			expect.arrayContaining([
				[mockTerrain, 1, 3, 0],
				[mockTerrain, 2, 3, 0],
				[mockTerrain, 3, 3, 0],
			]),
		);
	});

	it('should handle negative coordinates', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, -2, -1, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 0, 1, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		expect(result).toHaveLength(9);
		expect(result).toEqual(
			expect.arrayContaining([
				[mockTerrain, -2, -1, 0],
				[mockTerrain, -2, 0, 0],
				[mockTerrain, -2, 1, 0],
				[mockTerrain, -1, -1, 0],
				[mockTerrain, -1, 0, 0],
				[mockTerrain, -1, 1, 0],
				[mockTerrain, 0, -1, 0],
				[mockTerrain, 0, 0, 0],
				[mockTerrain, 0, 1, 0],
			]),
		);
	});

	it('should always use the terrain from topLeft coordinate', () => {
		const topLeftTerrain = { id: 'terrain1' } as Terrain;
		const bottomRightTerrain = { id: 'terrain2' } as Terrain;

		const topLeft: QualifiedCoordinate = [topLeftTerrain, 0, 0, 0];
		const bottomRight: QualifiedCoordinate = [bottomRightTerrain, 1, 1, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		// All returned coordinates should use the terrain from topLeft
		result.forEach((coordinate) => {
			expect(coordinate[0]).toBe(topLeftTerrain);
		});
	});

	it('should always set z-coordinate to 0', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, 0, 0, 5];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 1, 1, 10];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		// All returned coordinates should have z = 0
		result.forEach((coordinate) => {
			expect(coordinate[3]).toBe(0);
		});
	});

	it('should return coordinates in a consistent order (row by row)', () => {
		const topLeft: QualifiedCoordinate = [mockTerrain, 0, 0, 0];
		const bottomRight: QualifiedCoordinate = [mockTerrain, 2, 1, 0];

		const result = getTileCoordinatesInRectangle(topLeft, bottomRight);

		// Should be ordered by x first, then y (due to nested loops)
		const expected = [
			[mockTerrain, 0, 0, 0],
			[mockTerrain, 0, 1, 0],
			[mockTerrain, 1, 0, 0],
			[mockTerrain, 1, 1, 0],
			[mockTerrain, 2, 0, 0],
			[mockTerrain, 2, 1, 0],
		];

		expect(result).toEqual(expected);
	});
});
