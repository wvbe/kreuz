import { getMaterialDistribution } from './materialDistribution';

describe('getMaterialDistribution', () => {
	it('should return a valid material distribution object', () => {
		const result = getMaterialDistribution(0, 0);

		// Check structure
		expect(result).toHaveProperty('wall');
		expect(result).toHaveProperty('excavated');

		// Check wall materials
		expect(result.wall).toHaveProperty('granite');
		expect(result.wall).toHaveProperty('limestone');
		expect(result.wall).toHaveProperty('clay');
		expect(result.wall).toHaveProperty('dirt');

		// Check excavated materials
		expect(result.excavated).toHaveProperty('dirt');
		expect(result.excavated).toHaveProperty('wood');
		expect(result.excavated).toHaveProperty('pebbles');
		expect(result.excavated).toHaveProperty('stones');
		expect(result.excavated).toHaveProperty('concrete');
	});

	it.each([
		[-300, -9000],
		[-3, -3],
		[0, 0],
		[3, 3],
		[9000, 300],
	])('should return normalized probabilities that sum to 1 for coordinates %i, %i', (x, y) => {
		const result = getMaterialDistribution(10, 10);

		// Check wall materials sum to 1
		const wallSum = Object.values(result.wall).reduce((sum, value) => sum + value, 0);
		expect(wallSum).toBeCloseTo(1, 10);

		// Check excavated materials sum to 1
		const excavatedSum = Object.values(result.excavated).reduce((sum, value) => sum + value, 0);
		expect(excavatedSum).toBeCloseTo(1, 10);
	});

	it.each([
		[-300, -9000],
		[-3, -3],
		[0, 0],
		[3, 3],
		[9000, 300],
	])('should return deterministic results for the same coordinates %i, %i', (x, y) => {
		const result1 = getMaterialDistribution(x, y);
		const result2 = getMaterialDistribution(x, y);

		expect(result1).toEqual(result2);
	});

	it.each<[number, number][]>([
		[
			[5, 5],
			[6, 6],
		],
	])(
		'should return different results for different coordinates %i, %i and %i, %i',
		(one, two) => {
			const result1 = getMaterialDistribution(...one);
			const result2 = getMaterialDistribution(...two);

			expect(result1).not.toEqual(result2);
		},
	);

	it.each([
		[-300, -9000],
		[-3, -3],
		[0, 0],
		[3, 3],
		[9000, 300],
	])('should return valid probability values between 0 and 1 for coordinates %i, %i', (x, y) => {
		const result = getMaterialDistribution(x, y);

		// Check wall materials
		Object.values(result.wall).forEach((value) => {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThanOrEqual(1);
		});

		// Check excavated materials
		Object.values(result.excavated).forEach((value) => {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThanOrEqual(1);
		});
	});
});
