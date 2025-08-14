import Poisson from 'poisson-disk-sampling';

//https://www.npmjs.com/package/seedrandom
import seedrandom from 'seedrandom';

import { type SeedI } from '../types';

/**
 * Just a wrapper for the most random "random" shit I had to use at any point.
 */
export class ExpensiveRandom {
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
		const minimum = 0;
		const maximum = 1;
		const skewFactor = 1;
		// https://stackoverflow.com/a/49434653/2204864
		let seedIndex = 0;
		let uniformRandom1 = 0,
			uniformRandom2 = 0;
		while (uniformRandom1 === 0) {
			// Converting [0,1) to (0,1)
			uniformRandom1 = this.float(...seed, ++seedIndex);
		}
		while (uniformRandom2 === 0) {
			uniformRandom2 = this.float(...seed, ++seedIndex);
		}

		let normalValue =
			Math.sqrt(-2.0 * Math.log(uniformRandom1)) * Math.cos(2.0 * Math.PI * uniformRandom2);
		normalValue = normalValue / 10.0 + 0.5; // Translate to 0 -> 1
		if (normalValue > 1 || normalValue < 0)
			normalValue = this.normal(skewFactor, ...seed, seedIndex);
		// resample between 0 and 1 if out of range
		else {
			normalValue = Math.pow(normalValue, skewFactor); // Skew
			normalValue *= maximum - minimum; // Stretch to fill range
			normalValue += minimum; // offset to min
		}
		return normalValue;
	}
}

export class ShitRandom extends ExpensiveRandom {
	static float(..._seed: SeedI[]): number {
		return Math.random();
	}
	static boolean(seed: SeedI[], probabilityForTrue = 0.5): boolean {
		return this.float(...seed) <= probabilityForTrue;
	}
}

export const Random = ExpensiveRandom;
