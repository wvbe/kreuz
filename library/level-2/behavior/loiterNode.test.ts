import { describe, expect, it, mock, run } from 'tincan';
import { TestDriver, PersonEntity, Game, generateGridTerrainFromAscii } from '../../level-1/mod.ts';

import { loiterNode } from './loiterNode.ts';

describe('BT: loiterNode', () => {
	const pathStart = mock.fn();
	const pathEnd = mock.fn();
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
	);
	new TestDriver().attach(game);

	const entity = new PersonEntity('person-1', game.terrain.getTileClosestToXy(3, 3), {
		gender: 'm',
		firstName: 'test',
	});
	game.entities.add(entity);

	entity.$pathStart.on(pathStart);
	entity.$pathEnd.on(pathEnd);
	entity.$behavior.set(loiterNode);

	it('t=500.000', () => {
		game.time.steps(500_000);
		expect(game.time.now).toBe(500_000);
		expect(pathStart).toHaveBeenCalled();
		expect(pathEnd).toHaveBeenCalled();
	});
});

run();
