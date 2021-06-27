import seedrandom from 'seedrandom';

type Seed = Array<string | number | boolean>;

export class Random {
	static float(...seed: Seed): number {
		return seedrandom(seed.join('/')).double();
	}
	static arrayItem<P>(arr: P[], ...seed: Seed) {
		const index = Math.floor(this.float(...seed) * arr.length);
		return arr[index];
	}
}
