import { expect } from '@jest/globals';
import { generateFamilyTree } from './generateFamilyTree';

describe('generateFamilyTree', () => {
	it('.makeData()', async () => {
		const result = await generateFamilyTree(420, 100);
		expect(result.makeData()).toEqual({
			population: 254,
			populationCumulative: 347,
			couples: 57,
			widowers: 21,
			percentageHasChildren: 0.35826771653543305,
		});
	});
});
