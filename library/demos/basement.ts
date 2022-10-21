/**
 * "The basement"
 *
 * Rectangular squarish space, and only a very few things lying around.
 *
 * The expected outcome is a short-running game that ends the timeloop amicably because there is
 * no further events planned.
 */
import { Game, generateGridTerrainFromAscii, PersonEntity, PersonNeedId } from '@lib';
import { Demo } from './types.ts';

const demo: Demo = (driver) => {
	const terrain = generateGridTerrainFromAscii(`
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
		XXXXXXXXXXXX
	`);

	// entity.doJob(
	// 	new PatrolJob(entity, [terrain.getTileClosestToXy(0, 2), terrain.getTileClosestToXy(2, 2)]),
	// );
	const game = new Game('1', terrain);
	driver.attach(game);

	const entity = new PersonEntity('1', terrain.getTileClosestToXy(0, 0));
	game.entities.add(entity);
	const NEEDS: Record<PersonNeedId, { upUntil: number; label: string | null }[]> = {
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

	Object.keys(NEEDS)
		.filter((_k): _k is PersonNeedId => true)
		.forEach((key) =>
			NEEDS[key].reduce((min, { upUntil: max, label }) => {
				if (!label) {
					return max;
				}
				entity.needs[key as PersonNeedId].onBetween(min, max, () =>
					console.error(`${entity.label} is ${label}.`),
				);
				return max;
			}, 0),
		);

	return { driver, game };
};

export default demo;
