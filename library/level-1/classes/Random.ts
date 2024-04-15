import Poisson from 'https://esm.sh/poisson-disk-sampling@2.3.1';

//https://www.npmjs.com/package/seedrandom
import seedrandom from 'seedrandom';

import { type SeedI } from '../types.ts';

class ExpensiveRandom {
	/**
	 * Returns a random decimal number between 0 and 1.
	 */
	static float(...seed: SeedI[]): number {
		return seedrandom(seed.join('/')).double();
	}
	/**
	 * Returns a random number between your min and max.
	 */
	static between(min: number, max: number, ...seed: SeedI[]): number {
		return min + (max - min) * this.float(...seed);
	}

	/**
	 * Returns a yes or no randomly
	 */
	static boolean(seed: SeedI[], probabilityForTrue = 0.5): boolean {
		return seedrandom(seed.join('/')).quick() <= probabilityForTrue;
	}

	/**
	 * Returns a random item from the array
	 */
	static fromArray<X>(arr: X[], ...seed: SeedI[]): X {
		if (!arr.length) {
			throw new Error('Cannot pick a random value from an empty array');
		}
		const index = Math.floor(this.float(...seed) * arr.length);
		return arr[index];
	}

	static fromMapValues<X>(map: Record<string | number | symbol, X>, ...seed: SeedI[]) {
		return this.fromArray(Object.values(map), ...seed);
	}

	/**
	 * Returns a set of coordinates on a randomized Poisson distribution.
	 */
	static poisson(
		width: number,
		height: number,
		minDistance: number,
		...seed: SeedI[]
	): [number, number][] {
		let i = 0;
		const poisson = new Poisson({ shape: [width, height], minDistance }, () =>
			this.float(...seed, ++i),
		);
		return poisson.fill() as [number, number][];
	}

	/**
	 * Returns a normally distributed random number between 0 and 1. Because this is according to
	 * a normal distribution, there is a good chance this number will be close to 0.5 most of the time.
	 */
	static normal(...seed: SeedI[]): number {
		const min = 0;
		const max = 1;
		const skew = 1;
		// https://stackoverflow.com/a/49434653/2204864
		let ind = 0;
		let u = 0,
			v = 0;
		while (u === 0) {
			// u = Math.random(); //Converting [0,1) to (0,1)
			u = this.float(...seed, ++ind); //Converting [0,1) to (0,1)
		}
		while (v === 0) {
			v = this.float(...seed, ++ind);
		}

		let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
		num = num / 10.0 + 0.5; // Translate to 0 -> 1
		if (num > 1 || num < 0)
			num = this.normal(skew, ...seed, ind); // resample between 0 and 1 if out of range
		else {
			num = Math.pow(num, skew); // Skew
			num *= max - min; // Stretch to fill range
			num += min; // offset to min
		}
		return num;
	}
}

class FastRandom extends ExpensiveRandom {
	static float(..._seed: SeedI[]): number {
		return Math.random();
	}
	static boolean(seed: SeedI[], probabilityForTrue = 0.5): boolean {
		return this.float(...seed) <= probabilityForTrue;
	}
}
export const Random = ExpensiveRandom;
