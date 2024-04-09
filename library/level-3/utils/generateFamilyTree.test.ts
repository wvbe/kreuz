import { generateFamilyTree } from '@lib/generators';
import { expect } from '@test';

Deno.test('generateFamilyTree', async (test) => {
	const result = await generateFamilyTree(420, 100);

	await test.step('.makeData()', () => {
		expect(result.makeData()).toEqual({
			population: 254,
			populationCumulative: 347,
			couples: 57,
			widowers: 21,
			percentageHasChildren: 0.35826771653543305,
		});
	});
});
