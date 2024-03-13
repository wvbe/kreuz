import { describe, expect, it, run, beforeAll } from 'tincan';

import { TestDriver, Game, DEFAULT_ASSETS } from '@lib/assets';
import createGeneratorDemo from '../../scenarios/main.ts';

describe.skip('Loading the initial game', async () => {
	let game_original: Game, game_loaded: Game;
	beforeAll(async () => {
		game_original = await createGeneratorDemo(new TestDriver());
		game_loaded = await Game.fromSaveJson(
			new TestDriver(),
			DEFAULT_ASSETS,
			game_original.toSaveJson(),
		);

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
