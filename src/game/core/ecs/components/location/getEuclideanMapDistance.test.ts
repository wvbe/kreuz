import { expect } from '@jest/globals';
import { getEuclideanMapDistance } from './getEuclideanMapDistance';

describe('getEuclideanMapDistance', () => {
	it('should calculate distance between two points in 2D space', () => {
		const point1: [number, number, number] = [0, 0, 0];
		const point2: [number, number, number] = [3, 4, 0];

		const distance = getEuclideanMapDistance(point1, point2);
		expect(distance).toBe(5);
	});

	it('the z-coordinate is ignored', () => {
		const point1: [number, number, number] = [0, 0, 0];
		const point2: [number, number, number] = [0, 0, 5];

		const distance = getEuclideanMapDistance(point1, point2);
		expect(distance).toBe(0);
	});

	it('should return 0 for identical points', () => {
		const point1: [number, number, number] = [5, 10, 15];
		const point2: [number, number, number] = [5, 10, 15];

		const distance = getEuclideanMapDistance(point1, point2);
		expect(distance).toBe(0);
	});

	it('should handle negative coordinates', () => {
		const point1: [number, number, number] = [-1, -2, -3];
		const point2: [number, number, number] = [2, 4, 6];

		const distance = getEuclideanMapDistance(point1, point2);
		expect(distance).toBeCloseTo(6.708, 3);
	});
});
