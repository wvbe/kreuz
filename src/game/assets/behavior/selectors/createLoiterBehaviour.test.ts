import { expect } from '@jest/globals';
import { personArchetype } from '../../../core/ecs/archetypes/personArchetype';
import { generateEmptyGame } from '../../../test/generateEmptyGame';
import { createLoiterBehavior } from './createLoiterBehavior';

describe('BT: createLoiterBehavior()', () => {
	const { game, initGame } = generateEmptyGame();
	beforeAll(async () => {
		await initGame();
	});
	it('should create loiter behavior and verify path events', async () => {
		const entity = personArchetype.create({
			location: game.terrain.getTileClosestToXy(3, 3).location.get(),
			behavior: createLoiterBehavior(),
			icon: '🤖',
			name: 'Loiterbot',
		});
		await game.entities.add(entity);

		const pathStart = jest.fn((path: any) => {});
		const pathEnd = jest.fn();
		entity.$path.on((path) => (path ? pathStart(path) : pathEnd()));

		await game.time.steps(500_000);
		expect(game.time.now).toBe(500_000);
		expect(pathStart).toHaveBeenCalled();
		expect(pathEnd).toHaveBeenCalled();
	});
});
