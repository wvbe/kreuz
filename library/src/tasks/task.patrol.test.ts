import {
	beforeAll,
	describe,
	expect,
	it,
	mock,
	run,
} from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { DriverI } from '../drivers/types.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { PatrolTask } from './task.patrol.ts';

describe('PatrolTask', async () => {
	let game: Game, driver: DriverI, entity: PersonEntity;

	beforeAll(async () => {
		const terrain = generateGridTerrainFromAscii(`
			XXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXX
			XXXXXXXXXXXXXXXXX
		`);
		game = new Game('test', terrain);
		driver = new TestDriver({ delayBetweenJumps: 1 });
		driver.attach(game);

		entity = new PersonEntity('test', terrain.getTileClosestToXy(0, 0));
		game.entities.add(entity);
		entity.doJob(
			new PatrolTask({
				waypoints: [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)],
				repeating: true,
			}),
		);
	});

	it('walked around at least a few times', async () => {
		const pathStart = mock.fn();
		const onStepStart = mock.fn();
		const onStepEnd = mock.fn();
		const pathEnd = mock.fn();

		entity.$pathStart.on(pathStart);
		entity.$stepStart.on(onStepStart);
		entity.$stepEnd.on(onStepEnd);
		entity.$pathEnd.on(pathEnd);

		await driver.start();
		expect(game.time.now).toBe(97859);
		expect(onStepStart).toHaveBeenCalledTimes(6);
		expect(pathEnd).toHaveBeenCalledTimes(3);
	});

	it('time ends after cancelling job', () => {
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});

run();
