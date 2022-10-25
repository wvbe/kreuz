import { describe, expect, it, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import { PersonEntity, TestDriver } from '@lib';
import createFactoriesDemo from './churches.ts';

describe('Churches', () => {
	const { driver, game } = createFactoriesDemo(new TestDriver());

	const needIsFulfilled = mock.fn();
	const needIsNotSatisfied = mock.fn();

	const stace = game.entities.get(0) as PersonEntity;
	stace.needs.ideology.onBelow(0.3, needIsNotSatisfied);
	stace.needs.ideology.onAbove(0.99, needIsFulfilled);

	// game.time.steps(1_000_000);
	// it("Stace's depleted her need a few times", () => {
	// 	expect(needIsNotSatisfied).toHaveBeenCalledTimes(16);
	// });

	// it("Stace's replenished her need a few times", () => {
	// 	expect(needIsFulfilled).toHaveBeenCalledTimes(16);
	// });

	it('The game finishes by itself', async () => {
		expect(await driver.start()).toBeUndefined();
		// Around 250_000 is expected if "hygiene" is the slowest need decay
		// @TODO keep updated for changes to src/constants/needs.ts
		expect(game.time.now).toBe(250247);
		expect(game.time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});

run();
