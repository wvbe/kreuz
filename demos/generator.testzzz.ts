import { describe, run, expect, it } from 'https://deno.land/x/tincan@1.0.1/mod.ts';

import createGeneratorDemo from './generator.ts';
import { TestDriver } from '@lib';

describe('Default generator', () => {
	const game = createGeneratorDemo();
	const driver = new TestDriver().attach(game).start();
	it('The game finishes by itself', async () => {
		game.time.steps(1000);
		expect(game.time.getNextEventAbsoluteTime()).toBeTruthy();
	});
	game.stop();
});

run();
