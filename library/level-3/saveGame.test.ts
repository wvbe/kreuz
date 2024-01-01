import { describe, expect, it, run } from 'tincan';

import { TestDriver, Game } from '../level-1/mod.ts';
import createGeneratorDemo from './generator.ts';

describe('Save game', () => {
	const { game } = createGeneratorDemo(new TestDriver());

	it('Loading the initial game', () => {
		const json = game.toSaveJson();
		const game2 = Game.fromSaveJson(json);
		expect(game2).toEqual(game);
	});
});

run();
