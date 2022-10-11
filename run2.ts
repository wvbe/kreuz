/**
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { Game, TestDriver, PatrolJob, PersonEntity } from './mod.ts';
import { generateGridTerrainFromAscii } from './src/generators/generateGridTerrainFromAscii.ts';

const terrain = generateGridTerrainFromAscii(`
	XXX
	XXX
	XXX
`);

const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0));
entity.doJob(
	new PatrolJob(entity, [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)]),
);
const game = new Game('1', terrain, [entity]);

game.time.setTimeout(() => {
	entity.job?.destroy();
}, 10000);

new TestDriver({ delayBetweenJumps: 0 }).attach(game).start();

console.dir(game);
