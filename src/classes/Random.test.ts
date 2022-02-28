import { Random } from './Random';

it('Random.float', () => {
	expect(Random.float('x')).toBe(0.9080614664401105);
	expect(Random.float('y')).toBe(0.2992396904514766);
	expect(Random.float('z')).toBe(0.5205114627512043);
	expect(Random.float('z')).toBe(0.5205114627512043);
});

it('Random.fromArray', () => {
	const arr = ['apple', 'mango', 'banana', 'cucumber', 'avocado'];
	expect(Random.fromArray(arr, 'x')).toBe('avocado');
	expect(Random.fromArray(arr, 'y')).toBe('mango');
	expect(Random.fromArray(arr, 'z')).toBe('banana');
	expect(Random.fromArray(arr, 'z')).toBe('banana');
});
