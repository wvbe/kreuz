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
 *   deno run -A --inspect-brk demo.ts ./demos/factories.ts
 */

import { TestDriver } from './mod.ts';

const demo = await import(Deno.args[0]);
const { driver, game } = demo.default(new TestDriver());
driver.start();

console.dir(game, { depth: 10 });
