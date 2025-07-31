import { expect } from '@jest/globals';
import { Terrain } from '../../../terrain/Terrain';
import { QualifiedCoordinate, SimpleCoordinate } from '../../../terrain/types';
import { isMapLocationEqualTo } from './isMapLocationEqualTo';

describe('isMapLocationEqualTo', () => {
	const mockTerrain = new Terrain();
	const mockTerrain2 = new Terrain();

	describe('SimpleCoordinate (3-element arrays)', () => {
		it('should return true for identical coordinates', () => {
			const coord1: SimpleCoordinate = [1, 2, 3];
			const coord2: SimpleCoordinate = [1, 2, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should return false for different coordinates', () => {
			const coord1: SimpleCoordinate = [1, 2, 3];
			const coord2: SimpleCoordinate = [3, 5, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(false);
		});

		it('should return false when x coordinates differ', () => {
			const coord1: SimpleCoordinate = [1, 2, 3];
			const coord2: SimpleCoordinate = [2, 2, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(false);
		});

		it('should return false when y coordinates differ', () => {
			const coord1: SimpleCoordinate = [1, 2, 3];
			const coord2: SimpleCoordinate = [1, 3, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(false);
		});

		it('should return true when z coordinates differ', () => {
			const coord1: SimpleCoordinate = [1, 2, 3];
			const coord2: SimpleCoordinate = [1, 2, 4];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle zero coordinates', () => {
			const coord1: SimpleCoordinate = [0, 0, 0];
			const coord2: SimpleCoordinate = [0, 0, 0];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle negative coordinates', () => {
			const coord1: SimpleCoordinate = [-1, -2, -3];
			const coord2: SimpleCoordinate = [-1, -2, -3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle mixed positive and negative coordinates', () => {
			const coord1: SimpleCoordinate = [-1, 2, -3];
			const coord2: SimpleCoordinate = [-1, 2, -3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});
	});

	describe('QualifiedCoordinate (4-element arrays)', () => {
		it('should return true for identical coordinates with same terrain', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, 1, 2, 3];
			const coord2: QualifiedCoordinate = [mockTerrain, 1, 2, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should return false for coordinates with different terrains', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, 1, 2, 3];
			const coord2: QualifiedCoordinate = [mockTerrain2, 1, 2, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(false);
		});

		it('should return false when x coordinates differ', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, 1, 2, 3];
			const coord2: QualifiedCoordinate = [mockTerrain, 2, 2, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(false);
		});

		it('should return false when y coordinates differ', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, 1, 2, 3];
			const coord2: QualifiedCoordinate = [mockTerrain, 1, 3, 3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(false);
		});

		it('should return true when z coordinates differ', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, 1, 2, 3];
			const coord2: QualifiedCoordinate = [mockTerrain, 1, 2, 4];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle zero coordinates', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, 0, 0, 0];
			const coord2: QualifiedCoordinate = [mockTerrain, 0, 0, 0];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle negative coordinates', () => {
			const coord1: QualifiedCoordinate = [mockTerrain, -1, -2, -3];
			const coord2: QualifiedCoordinate = [mockTerrain, -1, -2, -3];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});
	});

	describe('Error cases', () => {
		it('should throw error when coordinate types are different (3 vs 4 elements)', () => {
			const simpleCoord: SimpleCoordinate = [1, 2, 3];
			const qualifiedCoord: QualifiedCoordinate = [mockTerrain, 1, 2, 3];

			expect(() => isMapLocationEqualTo(simpleCoord, qualifiedCoord)).toThrow(
				'Coordinate types are not the same',
			);
			expect(() => isMapLocationEqualTo(qualifiedCoord, simpleCoord)).toThrow(
				'Coordinate types are not the same',
			);
		});

		it('should throw error when first coordinate has wrong length', () => {
			const invalidCoord = [1, 2] as any;
			const validCoord: SimpleCoordinate = [1, 2, 3];

			expect(() => isMapLocationEqualTo(invalidCoord, validCoord)).toThrow(
				'Coordinate types are not the same',
			);
		});

		it('should throw error when second coordinate has wrong length', () => {
			const validCoord: SimpleCoordinate = [1, 2, 3];
			const invalidCoord = [1, 2] as any;

			expect(() => isMapLocationEqualTo(validCoord, invalidCoord)).toThrow(
				'Coordinate types are not the same',
			);
		});

		it('should throw error when both coordinates have wrong length', () => {
			const invalidCoord1 = [1, 2] as any;
			const invalidCoord2 = [3, 4] as any;

			expect(() => isMapLocationEqualTo(invalidCoord1, invalidCoord2)).toThrow(
				'Coordinate types is not supported',
			);
		});

		it('should throw error when coordinates have length other than 3 or 4', () => {
			const invalidCoord1 = [1, 2, 3, 4, 5] as any;
			const invalidCoord2 = [1, 2, 3, 4, 5] as any;

			expect(() => isMapLocationEqualTo(invalidCoord1, invalidCoord2)).toThrow(
				'Coordinate types is not supported',
			);
		});
	});

	describe('Edge cases', () => {
		it('should handle floating point coordinates', () => {
			const coord1: SimpleCoordinate = [1.5, 2.7, 3.1];
			const coord2: SimpleCoordinate = [1.5, 2.7, 3.1];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle very large numbers', () => {
			const coord1: SimpleCoordinate = [
				Number.MAX_SAFE_INTEGER,
				Number.MAX_SAFE_INTEGER,
				Number.MAX_SAFE_INTEGER,
			];
			const coord2: SimpleCoordinate = [
				Number.MAX_SAFE_INTEGER,
				Number.MAX_SAFE_INTEGER,
				Number.MAX_SAFE_INTEGER,
			];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});

		it('should handle very small numbers', () => {
			const coord1: SimpleCoordinate = [
				Number.MIN_SAFE_INTEGER,
				Number.MIN_SAFE_INTEGER,
				Number.MIN_SAFE_INTEGER,
			];
			const coord2: SimpleCoordinate = [
				Number.MIN_SAFE_INTEGER,
				Number.MIN_SAFE_INTEGER,
				Number.MIN_SAFE_INTEGER,
			];
			expect(isMapLocationEqualTo(coord1, coord2)).toBe(true);
		});
	});
});
