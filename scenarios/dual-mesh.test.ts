import { TestDriver, expect } from '@test';

import { factoryArchetype, personArchetype } from '@lib';
import createGeneratorDemo from './dual-mesh.ts';

Deno.test('Default generator', async (test) => {
	const game = await createGeneratorDemo(new TestDriver());

	expect(game.entities.filter((e) => personArchetype.test(e)).length).toBeGreaterThanOrEqual(12);
	expect(game.entities.filter((e) => factoryArchetype.test(e)).length).toBeGreaterThanOrEqual(6);
});
