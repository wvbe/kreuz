import { expect, it, describe, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { Random } from './Random.ts';

describe('Random', () => {
	it('.float()', () => {
		expect(Random.float('x')).toBe(0.9080614664401105);
		expect(Random.float('y')).toBe(0.2992396904514766);
		expect(Random.float('z')).toBe(0.5205114627512043);
		expect(Random.float('z')).toBe(0.5205114627512043);
	});
	it('.normal()', () => {
		expect(Random.normal('x')).toBe(0.4509135135199306);
		expect(Random.normal('y')).toBe(0.469344606863022);
		expect(Random.normal('z')).toBe(0.4121183286769527);
		expect(Random.normal('z')).toBe(0.4121183286769527);

		let outOfRange = 0;
		let lessThanHalf = 0;
		let moreThanHalf = 0;
		let tries = 10_000;
		while (tries) {
			const r = Random.normal(--tries, 'vfz');
			if (r < 0.3 || r > 0.7) {
				++outOfRange;
			}
			if (r < 0.5) {
				++lessThanHalf;
			}
			if (r > 0.5) {
				++moreThanHalf;
			}
		}
		expect(outOfRange).toBeLessThan(500);
		expect(lessThanHalf).toBeLessThan(5050);
		expect(moreThanHalf).toBeGreaterThan(4950);
	});

	it('.fromArray()', () => {
		const arr = ['apple', 'mango', 'banana', 'cucumber', 'avocado'];
		expect(Random.fromArray(arr, 'x')).toBe('avocado');
		expect(Random.fromArray(arr, 'y')).toBe('mango');
		expect(Random.fromArray(arr, 'z')).toBe('banana');
		expect(Random.fromArray(arr, 'z')).toBe('banana');
	});

	it('.poisson()', () => {
		expect(Random.poisson(5, 5, 2, 'x')).toEqual([
			[2.642138200031032, 1.6077739770904964],
			[2.263746251114599, 3.676522807819503],
			[0.31707903305207097, 2.7029013292843516],
			[4.710245859327236, 2.116069933916259],
			[4.497332486204895, 4.166420088867398],
			[0.1117912228886575, 0.010256782693391031],
			[0.47663320306353296, 4.812361813962148],
		]);
		expect(Random.poisson(5, 5, 2, 'y')).toEqual([
			[4.747335946064851, 2.2522277575932423],
			[1.0069642361403206, 1.6234470626451265],
			[3.995151703249915, 4.55968025820405],
			[3.135540853787476, 0.8715800086590784],
			[1.712603772757038, 4.3656778779927965],
		]);
		expect(Random.poisson(5, 5, 2, 'z')).toEqual([
			[2.418484994467611, 1.9002292692911271],
			[4.78259217711437, 1.5129627754429302],
			[3.6688336666730277, 4.744931852555598],
			[0.3798135998648675, 4.755859026806773],
			[0.30046029884485215, 1.3958249158110938],
		]);
		expect(Random.poisson(5, 5, 2, 'z')).toEqual([
			[2.418484994467611, 1.9002292692911271],
			[4.78259217711437, 1.5129627754429302],
			[3.6688336666730277, 4.744931852555598],
			[0.3798135998648675, 4.755859026806773],
			[0.30046029884485215, 1.3958249158110938],
		]);
	});
});

run();
