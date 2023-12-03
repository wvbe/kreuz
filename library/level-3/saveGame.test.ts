import { describe, expect, it, run } from 'tincan';

import { TestDriver } from '../level-1/mod.ts';
import createGeneratorDemo from './generator.ts';

describe('Save game', () => {
	const { game } = createGeneratorDemo(new TestDriver());

	it('saves', () => {
		const json = game.toSaveJson();
		// console.log(json);
		expect(true).toBe(true);
	});
	it('tick', () => {
		game.time.step();
		const json = game.toSaveJson();
		console.log(json);
	});
});

run();
