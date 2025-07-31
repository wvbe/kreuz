import { expect } from '@jest/globals';
import { getEuclideanDistance } from './getEuclideanDistance';

describe('getEuclideanDistance', () => {
	it('should calculate distance between two points in 3D space', () => {
		const point1: [number, number, number] = [0, 0, 0];
		const point2: [number, number, number] = [3, 4, 0];

		const distance = getEuclideanDistance(point1, point2);

		expect(distance).toBe(5);
	});

	it('should calculate distance with z-coordinate difference', () => {
		const point1: [number, number, number] = [0, 0, 0];
		const point2: [number, number, number] = [0, 0, 5];

		const distance = getEuclideanDistance(point1, point2);

		expect(distance).toBe(5);
	});

	it('should return 0 for identical points', () => {
		const point1: [number, number, number] = [5, 10, 15];
		const point2: [number, number, number] = [5, 10, 15];

		const distance = getEuclideanDistance(point1, point2);

		expect(distance).toBe(0);
	});

	it('should handle negative coordinates', () => {
		const point1: [number, number, number] = [-1, -2, -3];
		const point2: [number, number, number] = [2, 4, 6];

		const distance = getEuclideanDistance(point1, point2);

		// Expected: sqrt((2-(-1))² + (4-(-2))² + (6-(-3))²) = sqrt(9 + 36 + 81) = sqrt(126) ≈ 11.225
		expect(distance).toBeCloseTo(11.225, 3);
	});
});
