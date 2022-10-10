import {
	describe,
	expect,
	it,
	run,
	mock,
	beforeEach,
} from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { CivilianPersonEntity } from '../entities/CivilianPersonEntity.ts';
import { PersonEntity } from '../entities/PersonEntity.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../generators/generateGridTerrainFromAscii.ts';
import { HeadlessController } from '../controllers/HeadlessController.ts';
import { EntityI, TerrainI } from '../types.ts';
import { PatrolJob } from './PatrolJob.ts';

describe('PatrolJob', () => {
	const terrain = generateGridTerrainFromAscii(`
		XXX
		XXX
		XXX
	`);
	const entity = new PersonEntity('test', terrain.getTileClosestToXy(0, 0));
	entity.doJob(
		new PatrolJob(entity, [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)]),
	);
	const game = new Game('test', terrain, [entity]);
	game.time.setTimeout(() => entity.job?.destroy(), 10000);

	const onStepStart = mock.fn();
	const pathEnd = mock.fn();
	entity.$stepStart.on(onStepStart);
	entity.$pathEnd.on(pathEnd);

	const controller = new HeadlessController({
		delayBetweenJumps: 0,
	});
	controller.attachToGame(game);
	controller.startAnimationLoop();

	it('walked around at least a few times', () => {
		expect(onStepStart).toHaveBeenCalledTimes(6);
		expect(pathEnd).toHaveBeenCalledTimes(3);
	});

	it('time ends after cancelling job', () => {
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});

run();
