import { expect } from '@jest/globals';
import { timeToString } from './timeToString';

describe('timeToString', () => {
	it('should return an empty string for 0 time', () => {
		const result = timeToString(0);
		expect(result).toBe('no time');
	});

	it('should correctly convert time to string', () => {
		const testCases = [
			{ time: 1, expected: '1 second' },
			{ time: 60, expected: '1 minute' },
			{ time: 3600, expected: '1 hour' },
			{ time: 86400, expected: '1 day' },
			{ time: 172800, expected: '2 days' },
			{ time: 120, expected: '2 minutes' },
			{ time: 3661, expected: '1 hour 1 minute 1 second' },
			{ time: 90061, expected: '1 day 1 hour 1 minute 1 second' },
			{
				time: 123456789,
				expected: '3 years 11 months 18 days 21 hours 33 minutes 9 seconds',
			},
		];

		for (const testCase of testCases) {
			const result = timeToString(testCase.time);
			expect(result).toBe(testCase.expected);
		}
	});
});
