import { beforeAll, describe, expect, it, run } from 'tincan';

import createBasementDemo from './basement.ts';

import { DriverI, Game, TestDriver, type PersonEntity } from '@lib/core';

describe('"The basement"', async () => {
	let game: Game, driver: DriverI, melanie: PersonEntity;
	beforeAll(async () => {
		game = await createBasementDemo(new TestDriver());
		driver = new TestDriver();
		melanie = game.entities.get(0);

		driver.attach(game);
	});

	it('Melanie is called Melanie, and she has needs', () => {
		expect(melanie.name).toBe('Melanie');
		melanie.needs.forEach((need) => {
			expect(need.get()).toBeGreaterThan(0);
		});
	});

	it('The game finishes by itself', async () => {
		expect(await driver.startUntilStop()).toBeUndefined();

		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
		expect(game.time.now).toBeGreaterThan(0);
	});

	it("All of Melanie's needs are depleted", () => {
		melanie.needs.forEach((need) => {
			expect(need.get()).toBe(0);
		});
	});
});

run();
