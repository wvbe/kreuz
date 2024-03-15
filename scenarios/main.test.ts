import { beforeAll, describe, expect, it, run } from 'tincan';

import { Game, TestDriver, factoryArchetype, personArchetype } from '@lib';
import createGeneratorDemo from './main.ts';

describe('Default generator', async () => {
	let game: Game;
	beforeAll(async () => {
		game = await createGeneratorDemo(new TestDriver());
		// new TestDriver().attach(game);
	});

	it('Has several entities of various types', () => {
		expect(game.entities.filter((e) => personArchetype.test(e)).length).toBeGreaterThanOrEqual(12);
		expect(game.entities.filter((e) => factoryArchetype.test(e)).length).toBeGreaterThanOrEqual(6);
	});
});

run();
