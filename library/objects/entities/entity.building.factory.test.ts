import { describe, expect, it, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { Demo } from '../../demos/types.ts';
import { wheatProcessing } from '../constants/blueprints.ts';
import { bran, flour, wheat } from '../constants/materials.ts';
import { TestDriver } from '../drivers/TestDriver.ts';
import Game from '../Game.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { FactoryBuildingEntity } from './entity.building.factory.ts';
import { PersonEntity } from './entity.person.ts';

const demo: Demo = (driver) => {
	const game = new Game('1', generateGridTerrainFromAscii(`XXX`));
	driver.attach(game);

	const factory = new FactoryBuildingEntity('factory', game.terrain.getTileClosestToXy(0, 0), {
		maxWorkers: 3,
	});
	factory.setBlueprint(wheatProcessing);
	game.entities.add(factory);

	return { driver, game };
};

describe('FactoryBuildingEntity', () => {
	it(`Doesn't do anything on its own`, async () => {
		const { game, driver } = demo(new TestDriver());
		const factory = game.entities.get(0) as FactoryBuildingEntity;

		expect(factory.name).toBe('Mill');

		await driver.start();

		// Game ends because there is nothing to do
		expect(game.time.now).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		factory.inventory.change(wheat, 30);
		await driver.start();

		// Game ends because there is nothing to do
		expect(game.time.now).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		// Factory inventory was unchanged
		expect(factory.inventory.availableOf(wheat)).toBe(30);
		expect(factory.inventory.availableOf(flour)).toBe(0);
		expect(factory.inventory.availableOf(bran)).toBe(0);
	});

	it(`Goes to work when it has a worker`, async () => {
		const { game, driver } = demo(new TestDriver());
		await driver.start();

		// Game ends because there is nothing to do
		expect(game.time.now).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		const worker = new PersonEntity('worker', game.terrain.getTileClosestToXy(0, 0));
		game.entities.add(worker);
		const factory = game.entities.get(0) as FactoryBuildingEntity;
		factory.$workers.add(worker);
		await driver.start();

		// Game ends after the worker's needs expire, because there is nothing else to do
		expect(game.time.now).toBeGreaterThan(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		// Factory inventory was changed
		expect(factory.inventory.availableOf(wheat)).toBe(0);
		expect(factory.inventory.availableOf(flour)).toBe(0);
		expect(factory.inventory.availableOf(bran)).toBe(0);

		// A production cycle is immediately started when adding the correct ingredients
		factory.inventory.change(wheat, 30);
		expect(factory.inventory.availableOf(wheat)).toBe(28);
		expect(factory.inventory.availableOf(flour)).toBe(0);
		expect(factory.inventory.availableOf(bran)).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).not.toBe(Infinity);

		await driver.start();

		// Now production has started, and finished 15 times
		expect(factory.inventory.availableOf(wheat)).toBe(0);
		expect(factory.inventory.availableOf(flour)).toBe(15);
		expect(factory.inventory.availableOf(bran)).toBe(15);

		// Game ends after production cycles are forced to stop
		expect(game.time.now).toBeGreaterThan(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});

	it(`Works at a speed correlating to the amount of workers`, async () => {
		// Build the same factory twice, but with different amounts of workers. Then run both games
		// to the depletion of workers so that this timeout does not interfere with the actual test.
		const { game: game1, driver: driver1 } = demo(new TestDriver());
		const factory1 = game1.entities.get(0) as FactoryBuildingEntity;
		for (let i = 0; i < 1; i++) {
			const worker = new PersonEntity(String(i), game1.terrain.getTileClosestToXy(0, 0));
			game1.entities.add(worker);
			factory1.$workers.add(worker);
		}
		await driver1.start();
		expect(game1.time.getNextEventAbsoluteTime()).toBe(Infinity);

		// Build factory2 but with two workers
		const { game: game2, driver: driver2 } = demo(new TestDriver());
		const factory2 = game2.entities.get(0) as FactoryBuildingEntity;
		for (let i = 0; i < 2; i++) {
			const worker = new PersonEntity(String(i), game2.terrain.getTileClosestToXy(0, 0));
			game2.entities.add(worker);
			factory2.$workers.add(worker);
		}
		await driver2.start();
		expect(game2.time.getNextEventAbsoluteTime()).toBe(Infinity);

		const time1 = game1.time.now;
		const time2 = game2.time.now;

		// It took 15 cycles times the normal production length at 1x production speed (becaue 1 worker)
		// plus 50 time extra -- presumably for rounding reasons
		factory1.inventory.change(wheat, 30);
		await driver1.start();
		expect(game1.time.now - time1).toBe(wheatProcessing.options.fullTimeEquivalent * 15 + 50);

		// Using 2 works takes half the time
		factory2.inventory.change(wheat, 30);
		await driver2.start();
		expect(game2.time.now - time2).toBe((game1.time.now - time1) / 2);
	});
});

run();
