import { expect } from '@jest/globals';
import { personArchetype } from '../../level-1/ecs/archetypes/personArchetype';
import type { SimpleCoordinate } from '../../level-1/terrain/types';
import { createLoiterBehavior } from './reusable/nodes/createLoiterBehavior';

describe('BT: createLoiterBehavior()', () => {
	it('should create loiter behavior and verify path events', async () => {
		const game = {
			terrain: {
				getTileClosestToXy: (x: number, y: number) => ({
					location: {
						get: () => [x, y, 0] as SimpleCoordinate,
					},
				}),
			},
			entities: {
				add: async (entity: any) => {},
			},
			time: {
				now: 0,
				steps: async (steps: number) => {
					game.time.now = steps;
				},
			},
		};

		const entity = {
			...personArchetype.create({
				location: game.terrain.getTileClosestToXy(3, 3).location.get(),
				behavior: createLoiterBehavior(),
				icon: '🤖',
				name: 'Loiterbot',
			}),
			$pathStart: {
				on: (fn: any) => {},
			},
			$pathEnd: {
				on: (fn: any) => {},
			},
		};

		await game.entities.add(entity);

		const pathStart = jest.fn((path: any) => {});
		const pathEnd = jest.fn();
		entity.$pathStart.on(pathStart);
		entity.$pathEnd.on(pathEnd);

		await game.time.steps(500_000);
		expect(game.time.now).toBe(500_000);
		expect(pathStart).toHaveBeenCalled();
		expect(pathEnd).toHaveBeenCalled();
	});
});
