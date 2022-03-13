import Poisson from 'poisson-disk-sampling';
import seedrandom from 'seedrandom';
import { SeedI } from '../types';

export class Random {
	static float(...seed: SeedI[]): number {
		return seedrandom(seed.join('/')).double();
	}
	static fromArray<X>(arr: X[], ...seed: SeedI[]): X {
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
			Random.float(...seed, ++i)
		);
		return poisson.fill();
	}
}
