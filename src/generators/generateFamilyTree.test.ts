import { generateFamilyTree } from './generateFamilyTree';

xdescribe('generateFamilyTree', () => {
	let result: ReturnType<typeof generateFamilyTree>;
	it('doesnt crash', () => {
		expect(() => {
			result = generateFamilyTree(420, 500, 1);
		}).not.toThrow();
	});
	it('Data matches', () =>
		expect(result.makeData()).toMatchInlineSnapshot(`
		Object {
		  "couples": 2934,
		  "percentageHasChildren": 0.42927416926011447,
		  "population": 9961,
		  "populationCumulative": 37944,
		  "widowers": 836,
		}
	`));
	it('Age group matches', () =>
		expect(result.makeMermaidPiechartOfAgeDistribution()).toMatchSnapshot());

	it('Event log matches snapshot', () =>
		expect(generateFamilyTree(420, 200, 1).log).toMatchSnapshot());
});
