import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { PersonEntity, TestDriver } from '@lib';
import createDemo from './churches.ts';

describe('Churches', () => {
	const { driver, game } = createDemo(new TestDriver({ delayBetweenJumps: 1 }));

	const riane = game.entities.get(0) as PersonEntity;

	it('Riane is called Riane, and she has needs', () => {
		expect(riane.name).toBe('Riane');
		riane.needs.forEach((need) => {
			expect(need.get()).toBeGreaterThan(0);
		});
	});

	it('The game finishes by itself', async () => {
		expect(await driver.start()).toBeUndefined();

		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});

	it("All of Riane's needs are depleted", () => {
		riane.needs.forEach((need) => {
			expect(need.get()).toBe(0);
		});
	});
});

run();
