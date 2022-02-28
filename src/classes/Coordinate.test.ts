import { Coordinate } from './Coordinate';

describe('Coordinate', () => {
	it('#equals()', () => {
		expect(new Coordinate(1, 1, 1).equals(new Coordinate(1, 1, 1))).toBeTruthy();
		expect(new Coordinate(1, 1, 9).equals(new Coordinate(1, 1, 1))).toBeFalsy();
	});
	it('#transform()', () => {
		expect(new Coordinate(0, 0, 0).transform(1, 1, 1)).toEqual(new Coordinate(1, 1, 1));
	});
	it('#manhattanDistanceTo()', () => {
		expect(new Coordinate(0, 0, 0).manhattanDistanceTo(new Coordinate(1, 1, 1))).toBe(3);
	});
	it('#euclideanDistanceTo()', () => {
		expect(new Coordinate(0, 0, 0).euclideanDistanceTo(new Coordinate(1, 1, 1))).toBe(
			1.7320508075688774
		);
	});
	it('.clone()', () => {
		const coord = new Coordinate(0, 0, 0);
		const clone = Coordinate.clone(coord);

		expect(coord).not.toBe(clone);
		expect(coord).toEqual(clone);
		expect(coord.equals(clone)).toBeTruthy();
	});
});
