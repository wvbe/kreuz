import { describe, run, expect, it } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import createBasementDemo from './basement.ts';
import { TestDriver } from '@lib';
import { type PersonEntity } from '../objects/entities/entity.person.ts';

describe('"The basement"', () => {
	const { driver, game } = createBasementDemo(new TestDriver());
	const melanie = game.entities.get(0) as unknown as PersonEntity;

	it('Riane is called Riane, and she has needs', () => {
		expect(melanie.name).toBe('Melanie');
		melanie.needs.forEach((need) => {
			expect(need.get()).toBeGreaterThan(0);
		});
	});

	it('The game finishes by itself', async () => {
		expect(await driver.start()).toBeUndefined();

		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});

	it("All of Riane's needs are depleted", () => {
		melanie.needs.forEach((need) => {
			expect(need.get()).toBe(0);
		});
	});
});

run();
