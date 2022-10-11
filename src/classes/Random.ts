import Poisson from 'poisson-disk-sampling';

//https://www.npmjs.com/package/seedrandom
import seedrandom from 'seedrandom';

import { SeedI } from '../types.ts';

export class Random {
	static float(...seed: SeedI[]): number {
		return seedrandom(seed.join('/')).double();
	}

	static between(min: number, max: number, ...seed: SeedI[]): number {
		return min + (max - min) * Random.float(...seed);
	}

	static boolean(seed: SeedI[], probabilityForTrue: number = 0.5): boolean {
		return seedrandom(seed.join('/')).quick() <= probabilityForTrue;
	}

	static fromArray<X>(arr: X[], ...seed: SeedI[]): X {
		if (!arr.length) {
			throw new Error('Cannot pick a random value from an empty array');
		}
		const index = Math.floor(this.float(...seed) * arr.length);
		return arr[index];
	}

	static poisson(
		width: number,
		height: number,
		minDistance: number,
		...seed: SeedI[]
	): [number, number][] {
		let i = 0;
		const poisson = new Poisson({ shape: [width, height], minDistance }, () =>
			Random.float(...seed, ++i),
		);
		return poisson.fill() as [number, number][];
	}
}
