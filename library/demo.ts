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

import { TestDriver } from './mod.ts';

const demo = await import(self.Deno.args[0]);
const { driver, game } = demo.default(new TestDriver());
try {
	await driver.start();
	console.log('-----------------------');
} catch (e: unknown) {
	console.log('-----------------------');
	console.group('ERROR');
	console.log((e as Error).stack || (e as Error).message || e);
	console.groupEnd();
}
console.group('TIME');
console.log(game.time.now);
console.groupEnd();
console.group('GAME');
console.dir(game, { depth: 10 });
console.groupEnd();
