import { describe, expect, it, run, beforeAll } from 'tincan';

import { TestDriver, Game } from '@lib/core';
import { DEFAULT_ASSETS } from '@lib/assets';
import createGeneratorDemo from './generator.ts';

describe('Loading the initial game', async () => {
	let game_original: Game, game_loaded: Game;
	beforeAll(async () => {
		game_original = (await createGeneratorDemo(new TestDriver())).game;
		game_loaded = await Game.fromSaveJson(DEFAULT_ASSETS, game_original.toSaveJson());

		await new TestDriver().attach(game_loaded);
	});

	it('Has the same amount of entities', () => {
		expect(game_loaded.entities.length).toBe(game_original.entities.length);
	});

	it('Every entity is the same', () => {
		game_original.entities.forEach((entity, i) => {
			expect(game_loaded.entities.get(i)).toEqual(entity);
		});
	});
});

run();
