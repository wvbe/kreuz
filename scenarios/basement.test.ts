import { beforeAll, describe, expect, it, run } from 'tincan';

import createBasementDemo from './basement.ts';

import { DriverI, Game, TestDriver, personArchetype, type EcsArchetypeEntity } from '@lib';

describe('"The basement"', async () => {
	let game: Game, driver: DriverI, melanie: EcsArchetypeEntity<typeof personArchetype>;
	beforeAll(async () => {
		driver = new TestDriver();
		game = await createBasementDemo(driver);
		melanie = game.entities.get(0);
	});

	it('Melanie is called Melanie, and she has needs', () => {
		expect(melanie.name).toBe('Melanie');
		Object.values(melanie.needs).forEach((need) => {
			expect(need.get()).toBeGreaterThan(0);
		});
	});

	it('The game finishes by itself', async () => {
		expect(await driver.startUntilStop()).toBeUndefined();

		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
		expect(game.time.now).toBeGreaterThan(0);
	});

	it("All of Melanie's needs are depleted", () => {
		Object.values(melanie.needs).forEach((need) => {
			expect(need.get()).toBe(0);
		});
	});
});

run();
