import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import { PersonEntity } from './PersonEntity.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../generators/generateGridTerrainFromAscii.ts';

describe('Need', () => {
	const terrain = generateGridTerrainFromAscii(`X`);
	const entity = new PersonEntity('test', terrain.getTileClosestToXy(0, 0));
	const game = new Game('test', terrain, [entity]);

	const onTime = mock.fn();
	const onNeed = mock.fn();
	const onFoodNeed = mock.fn();

	game.time.on(onTime);
	entity.needs.food.on(onFoodNeed);
	Object.keys(entity.needs).forEach((key) =>
		entity.needs[key as keyof typeof entity.needs].on(onNeed),
	);

	const driver = new TestDriver({
		delayBetweenJumps: 0,
	});
	driver.attach(game).start();

	it('Needs are actually depleted', () => {
		expect(
			Object.keys(entity.needs)
				.map((key) => entity.needs[key as keyof typeof entity.needs].get())
				.every((need) => need === 0),
		).toBeTruthy();
	});

	it('It takes 1.000.000 time for all needs to deplete', () => {
		// Game stops after all timers ran out, which in this case is that of the slowest decaying
		// need:
		expect(game.time.now).toBe(1000_000);
	});

	it('All needs emitted an event once', () => {
		expect(onFoodNeed).toHaveBeenCalledTimes(1);

		expect(onNeed).toHaveBeenCalledTimes(Object.keys(entity.needs).length);
	});

	it('Needs expire with a minimal amount of actual ticks', () => {
		// There are 5 unique decay speeds across the needs, so to expire all of them we've jumped
		// to 5 different points in time.
		expect(onTime).toHaveBeenCalledTimes(5);
	});
});

run();
