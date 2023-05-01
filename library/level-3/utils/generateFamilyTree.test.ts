import { expect, it, describe, run } from 'tincan';
import { generateFamilyTree } from './generateFamilyTree.ts';

describe('generateFamilyTree', () => {
	let result: ReturnType<typeof generateFamilyTree>;

	expect(() => {
		result = generateFamilyTree(420, 100);
	}).not.toThrow();

	it('.makeData()', () =>
		expect(result.makeData()).toEqual({
			population: 254,
			populationCumulative: 347,
			couples: 57,
			widowers: 23,
			percentageHasChildren: 0.3543307086614173,
		}));
});

run();
