import { describe, expect, it, mock, run } from 'tincan';
import { loiterNode } from './loiterNode.ts';
import { beeKeeping } from '../blueprints.ts';
import { honey } from '../../level-1/inventory/materials.ts';

import { generateGridTerrainFromAscii } from '../../level-1/terrain/utils.ts';
import { TestDriver } from '../../level-1/drivers/TestDriver.ts';
import { PersonEntity } from '../../level-1/entities/entity.person.ts';
import Game from '../../level-1/Game.ts';

import { workInFactory } from './workInFactoryNode.ts';
import { FactoryBuildingEntity } from '../../level-1/entities/entity.building.factory.ts';
import { SelectorNode } from '../../level-1/behavior/SelectorNode.ts';
import { headOfState } from '../heroes.ts';

describe('BT: workInFactory', () => {
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

	const entity = new PersonEntity('person-1', game.terrain.getTileClosestToXy(3, 3).toArray(), {
		gender: 'm',
		firstName: 'test',
	});
	const factory = new FactoryBuildingEntity(
		'factory',
		game.terrain.getTileClosestToXy(5, 5).toArray(),
		headOfState,
		{
			maxWorkers: 1,
		},
	);
	factory.setBlueprint(beeKeeping);
	game.entities.add(entity, factory);

	entity.$pathStart.on(pathStart);
	entity.$pathEnd.on(pathEnd);

	// Wrap workInFactory in a selector node together with loiterNode, so that we will not end up
	// in a max-call-stack-exceeded scenario when there is no available factory.
	entity.$behavior.set(new SelectorNode(workInFactory, loiterNode));

	it('t=5.000 Walked to factory', () => {
		game.time.steps(5_000);
		expect(game.time.now).toBe(5_000);
		expect(pathStart).toHaveBeenCalledTimes(1);
		expect(pathEnd).toHaveBeenCalledTimes(1);
		expect(entity.$$location.get().equals(factory.$$location.get())).toBeTruthy();
		expect(factory.inventory.availableOf(honey)).toBe(0);
		expect(factory.$$progress.get()).toBeGreaterThan(0);
	});

	it('t=15.000 Finished first production cycle', () => {
		game.time.steps(10_000);
		expect(game.time.now).toBe(15_000);
		expect(pathStart).toHaveBeenCalledTimes(2);
		expect(pathEnd).toHaveBeenCalledTimes(1);
		expect(factory.inventory.availableOf(honey)).toBe(2);
	});

	it('t=23.000 Finished second production cycle', () => {
		game.time.steps(8_000);
		expect(game.time.now).toBe(23_000);
		expect(pathStart).toHaveBeenCalledTimes(3);
		expect(pathEnd).toHaveBeenCalledTimes(2);
		expect(factory.inventory.availableOf(honey)).toBe(2);
	});
	it('t=31.000 Finished third production cycle', () => {
		game.time.steps(8_000);
		expect(game.time.now).toBe(31_000);
		expect(pathStart).toHaveBeenCalledTimes(3);
		expect(pathEnd).toHaveBeenCalledTimes(3);
		expect(factory.inventory.availableOf(honey)).toBe(2);
	});
});

run();
