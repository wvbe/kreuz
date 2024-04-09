import { personArchetype } from '@lib';
import { beforeAll, describe, expect, generateEmptyGame, it, mock, run } from '@test';

import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior.ts';

Deno.test('BT: createLoiterBehavior()', async (test) => {
	const game = await generateEmptyGame(),
		entity = personArchetype.create({
			location: game.terrain.getTileClosestToXy(3, 3).location.get(),
			behavior: createLoiterBehavior(),
			icon: '🤖',
			name: 'Loiterbot',
		});
	await game.entities.add(entity);

	const pathStart = mock.fn((path: any) => {}),
		pathEnd = mock.fn();
	entity.$pathStart.on(pathStart);
	entity.$pathEnd.on(pathEnd);

	await test.step('t=500.000', async () => {
		await game.time.steps(500_000);
		expect(game.time.now).toBe(500_000);
		expect(pathStart).toHaveBeenCalled();
		expect(pathEnd).toHaveBeenCalled();
	});
});
