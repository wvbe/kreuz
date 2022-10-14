/**
 * The expected outcome is a game that keeps on running.
 */

import { Game, PersonEntity, PersonNeedsI, TestDriver } from '@lib';
import { generateDualMeshTerrain } from './utils/generateDualMeshTerrain.ts';
import { generateEntities } from './utils/generateEntities.ts';

// IIFE now so that this is easy to refactor later.
const game = (() => {
	const seed = 1;
	const terrain = generateDualMeshTerrain(seed, 20, 1);
	const entities = generateEntities(seed, 20, terrain);
	return new Game(seed, terrain, entities);
})();

// game.entities.forEach((entity) => {
// 	entity.$$location.on(() => console.log(`Entity "${entity.label}" changed location`));
// });
const persons = game.entities.filter(
	(entity): entity is PersonEntity => entity instanceof PersonEntity,
);
console.log(`-- ${persons.length} persons`);

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

persons.forEach((entity) => {
	Object.keys(NEEDS)
		.filter((k): k is keyof PersonNeedsI => true)
		.forEach((key) =>
			NEEDS[key].reduce((min, { upUntil: max, label }, index) => {
				entity.needs[key].onBetween(min, max, () => console.log(`${entity.label} is ${label}.`));
				return max;
			}, 0),
		);
});

persons.forEach((person) => console.log(`@${person.label} is on job: ${person.job?.label}`));

new TestDriver().attach(game).start();
