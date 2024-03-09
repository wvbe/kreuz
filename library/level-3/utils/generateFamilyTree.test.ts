import { expect, it, describe, run } from 'tincan';
import { generateFamilyTree } from './generateFamilyTree.ts';

describe('generateFamilyTree', () => {
	let result: ReturnType<typeof generateFamilyTree> extends Promise<infer P> ? P : never;

	expect(async () => {
		result = await generateFamilyTree(420, 100);
	}).not.toThrow();

	it('.makeData()', () =>
		expect(result.makeData()).toEqual({
			population: 254,
			populationCumulative: 347,
			couples: 57,
			widowers: 21,
			percentageHasChildren: 0.35826771653543305,
		}));
});

run();
