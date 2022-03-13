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
		  "couples": 2998,
		  "percentageHasChildren": 0.4326923076923077,
		  "population": 10088,
		  "populationCumulative": 37944,
		  "widowers": 835,
		}
	`));
	it('Age group matches', () =>
		expect(result.makeMermaidPiechartOfAgeDistribution()).toMatchSnapshot());

	it('Event log matches snapshot', () =>
		expect(generateFamilyTree(420, 200, 1).log).toMatchSnapshot());
});
