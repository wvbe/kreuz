import { describe, expect, it, run } from 'tincan';

import { TestDriver, Game } from '../level-1/mod.ts';
import createGeneratorDemo from './generator.ts';
import { DEFAULT_ASSETS } from '@lib';

describe('Save game', () => {
	const { game } = createGeneratorDemo(new TestDriver());

	describe('Loading the initial game', async () => {
		const json = game.toSaveJson();
		const game2 = Game.fromSaveJson(DEFAULT_ASSETS, json);
		// expect(game2).toEqual(game);
		describe('Equal entities', () => {
			it('Has the same amount of entities', () => {
				expect(game2.entities.length).toBe(game.entities.length);
			});
			game.entities.forEach((entity, i) =>
				it(`Entity "${entity.label}"`, () => expect(game2.entities.get(i)).toEqual(entity)),
			);
		});
	});
});

run();
