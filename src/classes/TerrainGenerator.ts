/**
 * Adapted from
 *   https://github.com/hunterloftis/playfuljs-demos/blob/gh-pages/terrain/index.html#L118
 */

import { Random } from '../util/Random';

export const OUT_OF_BOUNDS = Symbol();

function average(values: Array<number | typeof OUT_OF_BOUNDS>) {
	var valid = values.filter((val): val is number => typeof val === 'number');
	var total = valid.reduce<number>((sum, val) => sum + val, 0);
	return total / valid.length;
}

export class TerrainGenerator {
	private size: number;
	private max: number;
	private map: Float32Array;
	private seed;

	constructor(seed: string, size: number) {
		this.seed = seed;
		const detail = Math.ceil(Math.log(size) / Math.log(2));
		this.size = Math.pow(2, detail) + 1;
		this.max = this.size - 1;
		this.map = new Float32Array(this.size * this.size);
	}

	public generate(roughness: number) {
		this.set(0, 0, this.max);
		this.set(this.max, 0, this.max / 2);
		this.set(this.max, this.max, 0);
		this.set(0, this.max, this.max / 2);

		this.divide(this.max, roughness);
	}

	public get(x: number, y: number) {
		if (x < 0 || x > this.max || y < 0 || y > this.max) {
			return OUT_OF_BOUNDS;
		}
		return this.map[x + this.size * y];
	}

	private set(x: number, y: number, val: number) {
		this.map[x + this.size * y] = val;
	}

	private divide(size: number, roughness: number) {
		var x,
			y,
			half = size / 2;
		var scale = roughness * size;
		if (half < 1) return;

		for (y = half; y < this.max; y += size) {
			for (x = half; x < this.max; x += size) {
				this.square(
					x,
					y,
					half,
					Random.float(this.seed, size, 'square', x, y) * scale * 2 - scale
				);
			}
		}
		for (y = 0; y <= this.max; y += half) {
			for (x = (y + half) % size; x <= this.max; x += size) {
				this.diamond(
					x,
					y,
					half,
					Random.float(this.seed, size, 'square', x, y) * scale * 2 - scale
				);
			}
		}
		this.divide(size / 2, roughness);
	}

	private square(x: number, y: number, size: number, offset: number) {
		var ave = average([
			this.get(x - size, y - size), // upper left
			this.get(x + size, y - size), // upper right
			this.get(x + size, y + size), // lower right
			this.get(x - size, y + size) // lower left
		]);
		this.set(x, y, ave + offset);
	}

	private diamond(x: number, y: number, size: number, offset: number) {
		var ave = average([
			this.get(x, y - size), // top
			this.get(x + size, y), // right
			this.get(x, y + size), // bottom
			this.get(x - size, y) // left
		]);
		this.set(x, y, ave + offset);
	}
}
