import {
	beforeAll,
	describe,
	expect,
	it,
	mock,
	run,
} from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { PatrolTask } from './task.patrol.ts';

async function createTestGame(timeoutToEnd: number) {
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
	entity.$stepStart.on(onStepStart);

	const pathEnd = mock.fn();
	entity.$pathEnd.on(pathEnd);

	entity.doJob(
		new PatrolTask({
			waypoints: [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)],
			repeating: true,
		}),
	);

	game.time.setTimeout(() => {
		game.entities.forEach((entity) => entity.detach());
	}, timeoutToEnd);

	await driver.start();

	return { game, onStepStart, pathEnd };
}

describe('PatrolTask', async () => {
	// @TODO @BUG
	//   This test never finishes if the timeout lands in between some timeouts -- eg. when
	//   setting it to 10_000.

	let game: Game, onStepStart: () => void, pathEnd: () => void;

	beforeAll(async () => {
		const prep = await createTestGame(120000);
		game = prep.game;
		onStepStart = prep.onStepStart;
		pathEnd = prep.pathEnd;
	});

	it('walked around at least a few times', () => {
		expect(onStepStart).toHaveBeenCalledTimes(8);
		expect(pathEnd).toHaveBeenCalledTimes(4);
	});
	it('time ends after cancelling job', () => {
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});

run();
