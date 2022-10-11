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

entity.needs.food.onBetween(0, 0.1, () => {
	console.log(`${entity.label} is getting very hungry, ${entity.needs.food.get()}`);
});

game.time.setTimeout(() => {
	entity.job?.destroy();
}, 10000);

await new TestDriver().attach(game).start();

console.log('Game ended amicably');
