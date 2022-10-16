import { expect, it, describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { Coordinate } from './Coordinate.ts';

describe('Coordinate', () => {
	it('.equals()', () => {
		expect(new Coordinate(1, 1, 1).equals(new Coordinate(1, 1, 1))).toBeTruthy();
		expect(new Coordinate(1, 1, 9).equals(new Coordinate(1, 1, 1))).toBeFalsy();
	});
	it('.transform()', () => {
		expect(new Coordinate(0, 0, 0).transform(1, 1, 1)).toEqual(new Coordinate(1, 1, 1));
	});
	it('.manhattanDistanceTo()', () => {
		expect(new Coordinate(0, 0, 0).manhattanDistanceTo(new Coordinate(1, 1, 1))).toBe(3);
	});
	it('.euclideanDistanceTo()', () => {
		expect(new Coordinate(0, 0, 0).euclideanDistanceTo(new Coordinate(1, 1, 1))).toBe(
			1.7320508075688774,
		);
		expect(new Coordinate(0, 0, 0).euclideanDistanceTo(new Coordinate(1, 1, 0))).toBe(Math.sqrt(2));
	});
	it('.angleTo()', () => {
		const from = new Coordinate(0, 0, 0);

		expect(from.angleTo(new Coordinate(0.5 * Math.sqrt(3), 0.5, 0)).toFixed(8)).toBe(
			((1 / 6) * Math.PI).toFixed(8),
		);
		expect(from.angleTo(new Coordinate(0.5, 0.5 * Math.sqrt(3), 0)).toFixed(8)).toBe(
			((1 / 3) * Math.PI).toFixed(8),
		);
		expect(from.angleTo(new Coordinate(0, 1, 0))).toBe(0.5 * Math.PI);
		expect(from.angleTo(new Coordinate(-0.5 * Math.sqrt(3), 0.5, 0)).toFixed(8)).toBe(
			((5 / 6) * Math.PI).toFixed(8),
		);
		expect(from.angleTo(new Coordinate(-1, 0, 0))).toBe(1 * Math.PI);
		expect(from.angleTo(new Coordinate(-0.5, -0.5 * Math.sqrt(3), 0)).toFixed(8)).toBe(
			((4 / 3) * Math.PI).toFixed(8),
		);
		expect(from.angleTo(new Coordinate(-1, 1, 0))).toBe(0.75 * Math.PI);
		expect(from.angleTo(new Coordinate(0, -1, 0))).toBe(1.5 * Math.PI);
		expect(from.angleTo(new Coordinate(0.5, -0.5 * Math.sqrt(3), 0)).toFixed(8)).toBe(
			((5 / 3) * Math.PI).toFixed(8),
		);
		expect(from.angleTo(new Coordinate(-1, -1, 0))).toBe(1.25 * Math.PI);
		expect(from.angleTo(new Coordinate(1, -1, 0))).toBe(1.75 * Math.PI);
	});
	it('static .clone()', () => {
		const coord = new Coordinate(0, 0, 0);
		const clone = Coordinate.clone(coord);

		expect(coord).not.toBe(clone);
		expect(coord).toEqual(clone);
		expect(coord.equals(clone)).toBeTruthy();
	});
});

run();
