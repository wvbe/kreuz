/**
 * @file
 * This script runs any one of the demos from demos/
 *
 * Use as follows:
 *
 *   deno run -A demo.ts ./demos/factories.ts
 *
 * Or:
 *
 *   deno run -A --inspect-brk demo.ts ./level-3/factories.ts
 */

import { Demo, TestDriver } from '../../library/mod.ts';

const demo: Demo = await import(self.Deno.args[0]);
const driver = new TestDriver();
const game = await demo.default(driver);

try {
	console.log('-----------------------');
	await game.driver.startUntilStop();
	console.log('-----------------------');
	console.log(`Game stopped  at t=${game.time.now}`);
	console.log(game.time.hasNextEvent());
} catch (e: unknown) {
	console.log('-----------------------');
	console.group('ERROR');
	console.log((e as Error).stack || (e as Error).message || e);
	console.groupEnd();
}
