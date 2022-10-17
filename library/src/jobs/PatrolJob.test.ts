import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { PatrolJob } from './PatrolJob.ts';

describe('PatrolJob', () => {
	const terrain = generateGridTerrainFromAscii(`
		XXX
		XXX
		XXX
	`);
	const game = new Game('test', terrain);
	const driver = new TestDriver();
	driver.attach(game);

	const entity = new PersonEntity('test', terrain.getTileClosestToXy(0, 0));
	game.entities.add(entity);

	const onStepStart = mock.fn();
	const pathEnd = mock.fn();
	entity.$stepStart.on(onStepStart);
	entity.$pathEnd.on(pathEnd);

	entity.doJob(
		new PatrolJob(entity, [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)]),
	);

	game.time.setTimeout(() => {
		// Remove all future events, bringing the game loop to an end
		game.time.clear();
	}, 10000);

	driver.start();
	it('walked around at least a few times', () => {
		expect(onStepStart).toHaveBeenCalledTimes(6);
		expect(pathEnd).toHaveBeenCalledTimes(3);
	});
	it('time ends after cancelling job', () => {
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});

run();
