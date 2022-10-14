/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import {
	Game,
	TestDriver,
	PatrolJob,
	PersonEntity,
	generateGridTerrainFromAscii,
	PersonNeedsI,
} from '@lib';

const terrain = generateGridTerrainFromAscii(`
	XXX
	XXX
	XXX
`);

const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0));
// entity.doJob(
// 	new PatrolJob(entity, [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)]),
// );
const game = new Game('1', terrain, [entity]);

// entity.needs.food.onBetween(0, 0.1, () => {
// 	console.log(`${entity.label} is getting very hungry, ${entity.needs.food.get()}`);
// });

// game.time.setTimeout(() => {
// 	entity.job?.destroy();
// }, 10000);

const NEEDS: Record<keyof PersonNeedsI, { upUntil: number; label: string | null }[]> = {
	food: [
		{ upUntil: 5 / 100, label: 'literally starving' },
		{ upUntil: 15 / 100, label: 'very hungry' },
		{ upUntil: 30 / 100, label: 'needs a snack' },
		{ upUntil: 75 / 100, label: null },
		{ upUntil: 90 / 100, label: 'feeling fortified' },
		{ upUntil: Infinity, label: 'stuffed' },
	],
	water: [
		{ upUntil: 5 / 100, label: 'dying from dehydration' },
		{ upUntil: 15 / 100, label: 'parched' },
		{ upUntil: 30 / 100, label: 'thirsty' },
		{ upUntil: 75 / 100, label: null },
		{ upUntil: 90 / 100, label: 'feeling refreshed' },
		{ upUntil: Infinity, label: 'had too much' },
	],
	sleep: [
		{ upUntil: 5 / 100, label: 'passing out' },
		{ upUntil: 15 / 100, label: 'very tired' },
		{ upUntil: 30 / 100, label: "lil' sleepy" },
		{ upUntil: 75 / 100, label: null },
		{ upUntil: 90 / 100, label: 'rested' },
		{ upUntil: Infinity, label: 'rejuvenated' },
	],
	hygiene: [],
	spirituality: [],
};

game.entities
	.filter((entity): entity is PersonEntity => entity instanceof PersonEntity)
	.forEach((entity) => {
		Object.keys(NEEDS)
			.filter((k): k is keyof PersonNeedsI => true)
			.forEach((key) =>
				NEEDS[key].reduce((min, { upUntil: max, label }, index) => {
					entity.needs[key].onBetween(min, max, () => console.log(`${entity.label} is ${label}.`));
					return max;
				}, 0),
			);
	});

await new TestDriver().attach(game).start();

console.log('Game ended amicably');
