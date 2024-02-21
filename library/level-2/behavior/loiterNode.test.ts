import { beforeAll, describe, expect, it, mock, run } from 'tincan';
import { Game, PersonEntity, TestDriver, generateGridTerrainFromAscii } from '@lib/core';

import { DEFAULT_ASSETS } from '../DEFAULT_ASSETS.ts';
import { loiterNode } from './loiterNode.ts';

describe('BT: loiterNode', async () => {
	const game = new Game(
			'1',
			generateGridTerrainFromAscii(`
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
				XXXXXXXXXXXXXXXXXXXXX
			`),
			DEFAULT_ASSETS,
		),
		entity = new PersonEntity('person-1', game.terrain.getTileClosestToXy(3, 3).toArray(), {
			gender: 'm',
			firstName: 'test',
		});

	const pathStart = mock.fn(),
		pathEnd = mock.fn();
	entity.$pathStart.on(pathStart);
	entity.$pathEnd.on(pathEnd);

	beforeAll(async () => {
		await new TestDriver().attach(game);
		await game.entities.add(entity);
		await entity.$behavior.set(loiterNode);
	});

	it('t=500.000', async () => {
		await game.time.steps(500_000);
		expect(game.time.now).toBe(500_000);
		expect(pathStart).toHaveBeenCalled();
		expect(pathEnd).toHaveBeenCalled();
	});
});

run();
