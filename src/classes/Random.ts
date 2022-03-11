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
}
