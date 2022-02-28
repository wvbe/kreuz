import seedrandom from 'seedrandom';

type Seed = Array<string | number | boolean>;

export class Random {
	static float(...seed: Seed): number {
		return seedrandom(seed.join('/')).double();
	}
	static fromArray<X>(arr: X[], ...seed: Seed): X {
		const index = Math.floor(this.float(...seed) * arr.length);
		return arr[index];
	}
}
