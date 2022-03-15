import { Random } from '../../classes/Random';
import { SeedI } from '../../types';

type Options = {
	minimumBuildingLength: number;
};

export class RectangleParty {
	x: number;
	y: number;
	w: number;
	h: number;
	parent?: RectangleParty;
	children: RectangleParty[] = [];

	constructor(seed: SeedI[], x: number, y: number, w: number, h: number, options: Options) {
		// Constructor is an adaption of https://editor.p5js.org/runemadsen/sketches/rkbBsG_1z

		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;

		// then figure out if we need to draw another
		var splitWidth = Random.boolean(seed);
		var splitWhere = Random.between(0.3, 0.7, ...seed);
		const baseAspectRatio = w / h;

		if ((splitWidth && this.w > options.minimumBuildingLength) || baseAspectRatio > 3) {
			const boundary = this.w * splitWhere;
			this.children.push(
				new RectangleParty([...seed, 1], this.x, this.y, boundary, this.h, options)
			);
			this.children.push(
				new RectangleParty(
					[...seed, 2],
					this.x + boundary,
					this.y,
					this.w * (1 - splitWhere),
					this.h,
					options
				)
			);
		} else if (this.h > options.minimumBuildingLength || baseAspectRatio < 0.3) {
			const boundary = this.h * splitWhere;
			this.children.push(
				new RectangleParty([...seed, 1], this.x, this.y, this.w, boundary, options)
			);
			this.children.push(
				new RectangleParty(
					[...seed, 2],
					this.x,
					this.y + boundary,
					this.w,
					this.h * (1 - splitWhere),
					options
				)
			);
		}
	}

	label() {
		return `[${this.x}, ${this.y}, ${this.w}, ${this.h}]`;
	}

	debug(): string {
		let level = 0,
			z: RectangleParty = this;
		while (z.parent) {
			level++;
			z = z.parent;
		}
		return [
			'  '.repeat(level) + this.label(),
			...this.children
				.reduce<string[]>((lines, c) => [...lines, ...c.debug().split('\n')], [])
				.map(line => '  '.repeat(level) + '- ' + line)
		].join('\n');
	}

	emit(): RectangleParty[] {
		if (!this.children.length) {
			return [this];
		} else {
			return this.children.reduce<RectangleParty[]>(
				(all, child) => [...all, ...child.emit()],
				[]
			);
		}
	}

	static init(seed: SeedI[], width: number, height: number, options: Options) {
		return new RectangleParty(seed, 0, 0, width, height, options);
	}
}
