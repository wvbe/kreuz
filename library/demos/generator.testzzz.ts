import { describe, run, expect, it } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import createGeneratorDemo from './generator.ts';
import { TestDriver } from '@lib';

describe('Default generator', () => {
	const driver = new TestDriver();
	const game = createGeneratorDemo(driver);
	driver.steps(100000);
	it('The game finishes by itself', async () => {
		game.time.steps(1000);
		expect(game.time.getNextEventAbsoluteTime()).toBeTruthy();
	});
	game.stop();
});

run();
