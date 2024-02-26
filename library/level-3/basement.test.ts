import { beforeAll, describe, expect, it, run } from 'tincan';

import createBasementDemo from './basement.ts';

import { DriverI, Game, TestDriver, type PersonEntity } from '@lib/core';

describe('"The basement"', async () => {
	let game: Game, driver: DriverI, melanie: PersonEntity;
	beforeAll(async () => {
		const demo = await createBasementDemo(new TestDriver());
		game = demo.game;
		driver = demo.driver;
		melanie = game.entities.get(0);
	});

	it('Riane is called Riane, and she has needs', () => {
		expect(melanie.name).toBe('Melanie');
		melanie.needs.forEach((need) => {
			expect(need.get()).toBeGreaterThan(0);
		});
	});

	it('The game finishes by itself', async () => {
		expect(await driver.startUntilStop()).toBeUndefined();

		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});

	it("All of Riane's needs are depleted", () => {
		melanie.needs.forEach((need) => {
			expect(need.get()).toBe(0);
		});
	});
});

run();
