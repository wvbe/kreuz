import { describe, expect, it } from '@jest/globals';
import { normalizeWithinPriorityBands } from './normalizeWithinPriorityBands';

describe('normalizeWithinPriorityBands', () => {
	it('should normalize scores within priority bands and multiply by priority', () => {
		const scores = [
			{ priority: 1, score: 0 },
			{ priority: 1, score: 50 },
			{ priority: 1, score: 100 },
			{ priority: 2, score: 200 },
			{ priority: 2, score: 400 },
			{ priority: 2, score: 800 },
			{ priority: 3, score: 150.5 },
			{ priority: 3, score: 300.75 },
			{ priority: 3, score: 600.25 },
		];

		const result = normalizeWithinPriorityBands(scores);

		expect(result).toEqual([
			0, 0.5, 1, 0.25, 0.5, 1, 0.25072886297376096, 0.5010412328196585, 1,
		]);
	});

	it('should handle empty array', () => {
		const result = normalizeWithinPriorityBands([]);
		expect(result).toEqual([]);
	});

	it('should handle single priority band', () => {
		const scores = [
			{ priority: 1, score: 0 },
			{ priority: 1, score: 25.5 },
			{ priority: 1, score: 100 },
		];

		const result = normalizeWithinPriorityBands(scores);

		expect(result).toEqual([0, 0.255, 1]);
	});

	it('should handle scores with zero max in priority band', () => {
		const scores = [
			{ priority: 1, score: 0 },
			{ priority: 1, score: 0 },
			{ priority: 2, score: 500 },
		];

		const result = normalizeWithinPriorityBands(scores);

		expect(result).toEqual([0, 0, 1]);
	});

	it('should handle very large scores', () => {
		const scores = [
			{ priority: 1, score: 0 },
			{ priority: 1, score: 500 },
			{ priority: 1, score: 1000 },
			{ priority: 2, score: 750.123 },
			{ priority: 2, score: 999.999 },
		];

		const result = normalizeWithinPriorityBands(scores);

		expect(result).toEqual([0, 0.5, 1, 0.7501237501237501, 1]);
	});

	it('should handle negative scores (edge case)', () => {
		const scores = [
			{ priority: 1, score: -10 },
			{ priority: 1, score: 0 },
			{ priority: 1, score: 50 },
		];

		const result = normalizeWithinPriorityBands(scores);

		expect(result).toEqual([-0.2, 0, 1]);
	});
});
