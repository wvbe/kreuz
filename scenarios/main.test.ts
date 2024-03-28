import { TestDriver, beforeAll, describe, expect, it, run } from '@test';

import { Game, factoryArchetype, personArchetype } from '@lib';
import createGeneratorDemo from './main.ts';

Deno.test('Default generator', async (test) => {
	const game = await createGeneratorDemo(new TestDriver());

	expect(game.entities.filter((e) => personArchetype.test(e)).length).toBeGreaterThanOrEqual(12);
	expect(game.entities.filter((e) => factoryArchetype.test(e)).length).toBeGreaterThanOrEqual(6);
});
