/**
 * @TODO Decouple from level 2 and 3 APIs
 */

import { describe, expect, it, run } from 'tincan';
import { TestDriver } from '../drivers/TestDriver.ts';
import Game from '../Game.ts';
import { Blueprint } from '../inventory/Blueprint.ts';
import { Material } from '../inventory/Material.ts';
import { type DriverI } from '../mod.ts';
import { generateGridTerrainFromAscii } from '../terrain/utils.ts';
import { FactoryBuildingEntity } from './entity.building.factory.ts';
import { PersonEntity } from './entity.person.ts';
import { headOfState } from '../../level-2/heroes.ts';
import { DEFAULT_ASSETS } from '../../level-2/DEFAULT_ASSETS.ts';

// Test data
const wheat = new Material('Wheat', {
		symbol: 'WH',
		stackSize: 100,
	}),
	flour = new Material('Flour', {
		symbol: '🌸',
		stackSize: 100,
	}),
	bran = new Material('Bran', {
		symbol: 'B',
		stackSize: 100,
	}),
	wheatProcessing = new Blueprint(
		'Grinding wheat',
		[{ material: wheat, quantity: 2 }],
		[
			{ material: flour, quantity: 1 },
			{ material: bran, quantity: 1 },
		],
		{
			workersRequired: 1,
			fullTimeEquivalent: 5000,
			buildingName: 'Mill',
		},
	);

const demo = async (driver: DriverI) => {
	const game = new Game('1', generateGridTerrainFromAscii(`XXX`), DEFAULT_ASSETS);
	await driver.attach(game);

	const factory = new FactoryBuildingEntity(
		'factory',
		game.terrain.getTileClosestToXy(0, 0).toArray(),
		headOfState,
		{
			blueprint: wheatProcessing,
			maxStackSpace: 8,
			maxWorkers: 3,
		},
	);
	await game.entities.add(factory);

	return { driver, game };
};

describe('FactoryBuildingEntity', () => {
	it(`Doesn't do anything on its own`, async () => {
		const { game, driver } = await demo(new TestDriver());
		const factory = game.entities.get(0) as FactoryBuildingEntity;

		expect(factory.name).toBe('Mill');

		await driver.start();

		// Game ends because there is nothing to do
		expect(game.time.now).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		await factory.inventory.change(wheat, 30);
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
		const { game, driver } = await demo(new TestDriver());
		await driver.start();

		// Game ends because there is nothing to do
		expect(game.time.now).toBe(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		const worker = new PersonEntity('worker', game.terrain.getTileClosestToXy(0, 0).toArray(), {
			gender: 'm',
			firstName: 'test',
		});
		await game.entities.add(worker);
		const factory = game.entities.get<FactoryBuildingEntity>(0);
		await factory.$workers.add(worker);
		await driver.start();

		// Game ends after the worker's needs expire, because there is nothing else to do
		expect(game.time.now).toBeGreaterThan(0);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);

		// Factory inventory was changed
		expect(factory.inventory.availableOf(wheat)).toBe(0);
		expect(factory.inventory.availableOf(flour)).toBe(0);
		expect(factory.inventory.availableOf(bran)).toBe(0);

		// A production cycle is immediately started when adding the correct ingredients
		await factory.inventory.change(wheat, 30);
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
		// to the depletion of workers so that this timeout does not interfere with the actual test
		async function createDemoWithFactory(
			numberOfWorkers: number,
		): Promise<{ game: Game; driver: DriverI; factory: FactoryBuildingEntity }> {
			const { game, driver } = await demo(new TestDriver());
			const factory = game.entities.get(0) as FactoryBuildingEntity;
			for (let i = 0; i < numberOfWorkers; i++) {
				const worker = new PersonEntity(
					String(i),
					game.terrain.getTileClosestToXy(0, 0).toArray(),
					{
						gender: 'm',
						firstName: 'test ' + i,
					},
				);
				await game.entities.add(worker);
				await factory.$workers.add(worker);
			}
			return { game, driver, factory };
		}
		async function getTimeToCompletion(demo: any) {
			await demo.factory.inventory.change(wheat, 30);
			await demo.driver.start();
			return demo.game.time.now;
		}

		const demo1 = await createDemoWithFactory(1),
			demo1Completion = await getTimeToCompletion(demo1),
			demo2 = await createDemoWithFactory(4),
			demo2Completion = await getTimeToCompletion(demo2);

		console.log(
			demo1Completion,
			demo1.game.entities.length,
			demo2Completion,
			demo2.game.entities.length,
		);
		expect(demo1Completion).toBeGreaterThan(0);
		expect(demo2Completion).toBeGreaterThan(0);
		expect(demo1Completion).toBe(2 * demo2Completion);
	});
});

run();
