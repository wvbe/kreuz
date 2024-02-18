import { describe, expect, it, run } from 'tincan';

import { TestDriver, Game } from '../level-1/mod.ts';
import createGeneratorDemo from './generator.ts';
import { DEFAULT_ASSETS } from '@lib';

describe('Save game', () => {
	const { game } = createGeneratorDemo(new TestDriver());

	it('Loading the initial game', () => {
		const json = game.toSaveJson();
		const game2 = Game.fromSaveJson(DEFAULT_ASSETS, json);
		expect(game2).toEqual(game);
	});
});

run();
