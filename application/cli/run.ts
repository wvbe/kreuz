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

import { TestDriver } from '@test';
import { Game, healthComponent } from '@lib';

console.group('Importing demo');
const demo = await import(self.Deno.args[0]);
const driver = new TestDriver();
console.groupEnd();

console.group('Generating game');
const game = (await demo.default(driver)) as Game;
console.groupEnd();

try {
	console.log('-----------------------');
	console.group('Running game:');
	await game.driver.startUntilStop();
	console.groupEnd();
	console.log('-----------------------');
	console.group('Game stopped:');
	console.log('Graceful', true);
	console.log('    Time', game.time.now);
	console.log(
		'   Alive',
		game.entities.filter((entity) => healthComponent.test(entity) && entity.health.get() > 0)
			.length,
	);
	console.groupEnd();
} catch (e: unknown) {
	console.log('-----------------------');
	console.group('ERROR');
	console.log((e as Error).stack || (e as Error).message || e);
	console.groupEnd();
}
