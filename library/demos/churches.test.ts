import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { PersonEntity, TestDriver } from '@lib';
import createDemo from './churches.ts';

describe('Churches', () => {
	const { driver, game } = createDemo(new TestDriver());

	const needIsFulfilled = mock.fn();
	const needIsNotSatisfied = mock.fn();

	const riane = game.entities.get(0) as PersonEntity;
	riane.needs.ideology.onBelow(0.3, needIsNotSatisfied);
	riane.needs.ideology.onAbove(0.99, needIsFulfilled);

	riane.needs.ideology.onBelow(0.3, () => {
		console.log('LOW ideology');
	});
	riane.needs.food.onBelow(0.3, () => {
		console.log('LOW food');
	});
	riane.needs.water.onBelow(0.3, () => {
		console.log('LOW water');
	});
	riane.needs.hygiene.onBelow(0.3, () => {
		console.log('LOW hygiene');
	});
	riane.needs.sleep.onBelow(0.3, () => {
		console.log('LOW sleep');
	});

	riane.needs.ideology.onAbove(0.8, () => {
		console.log('HIGH ideology');
	});
	riane.needs.food.onAbove(0.8, () => {
		console.log('HIGH food');
	});
	riane.needs.water.onAbove(0.8, () => {
		console.log('HIGH water');
	});
	riane.needs.hygiene.onAbove(0.8, () => {
		console.log('HIGH hygiene');
	});
	riane.needs.sleep.onAbove(0.8, () => {
		console.log('HIGH sleep');
	});

	it('Riane is called Riane', () => {
		expect(riane.name).toBe('Riane');
	});

	it('The game finishes by itself', async () => {
		expect(await driver.start()).toBeUndefined();

		// This coincides with the time that all of Riane's needs have decayed
		//   for the random initial values that they were given and the current configuration
		//   in needs.ts
		expect(game.time.now).toBe(155045);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});

	it("Riane's depleted her need a few times", () => {
		game.time.steps(1_000_000);
		expect(needIsNotSatisfied).toHaveBeenCalledTimes(16);
	});

	// it("Riane's replenished her need a few times", () => {
	// 	expect(needIsFulfilled).toHaveBeenCalledTimes(16);
	// });
});

run();
