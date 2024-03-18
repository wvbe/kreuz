import { type Need } from '../entities/Need.ts';

export type PersonNeedId = 'nutrition' | 'hydration';
// | 'energy' | 'hygiene' | 'ideology';

export type PersonNeedMap = Record<PersonNeedId, Need>;

export const PERSON_NEEDS: Array<{
	id: PersonNeedId;
	label: string;
	decay: number;
	moods: Array<{ upUntil: number; label: string | null }>;
}> = [
	{
		id: 'nutrition',
		label: '🍴',
		decay: -1 / 350_000,
		moods: [
			{ upUntil: 5 / 100, label: 'literally starving' },
			{ upUntil: 15 / 100, label: 'very hungry' },
			{ upUntil: 30 / 100, label: 'needs a snack' },
			{ upUntil: 75 / 100, label: null },
			{ upUntil: 90 / 100, label: 'feeling fortified' },
			{ upUntil: Infinity, label: 'stuffed' },
		],
	},
	{
		id: 'hydration',
		label: '💦',
		decay: -1 / 200_000,
		moods: [
			{ upUntil: 5 / 100, label: 'dying from dehydration' },
			{ upUntil: 15 / 100, label: 'parched' },
			{ upUntil: 30 / 100, label: 'thirsty' },
			{ upUntil: 75 / 100, label: null },
			{ upUntil: 90 / 100, label: 'feeling refreshed' },
			{ upUntil: Infinity, label: 'had too much' },
		],
	},
	// {
	// 	id: 'energy',
	// 	label: '💤',
	// 	decay: -1 / 500_000,
	// 	moods: [
	// 		{ upUntil: 1 / 100, label: 'dead tired' },
	// 		{ upUntil: 5 / 100, label: 'passing out' },
	// 		{ upUntil: 15 / 100, label: 'very tired' },
	// 		{ upUntil: 30 / 100, label: "lil' energy" },
	// 		{ upUntil: 75 / 100, label: null },
	// 		{ upUntil: 90 / 100, label: 'rested' },
	// 		{ upUntil: Infinity, label: 'rejuvenated' },
	// 	],
	// },
	// {
	// 	id: 'hygiene',
	// 	label: '🛁',
	// 	decay: -1 / 750_000,
	// 	moods: [
	// 		{ upUntil: 1 / 100, label: 'smells like a dead body' },
	// 		{ upUntil: 20 / 100, label: 'filthy' },
	// 		{ upUntil: 33 / 100, label: 'uncomfortable' },
	// 		{ upUntil: 60 / 100, label: null },
	// 		{ upUntil: 90 / 100, label: 'fortified' },
	// 		{ upUntil: Infinity, label: 'squeeky clean' },
	// 	],
	// },
	// {
	// 	id: 'ideology',
	// 	label: '🙏',
	// 	decay: -1 / 1_000_000,
	// 	moods: [
	// 		{ upUntil: 1 / 100, label: 'dead inside' },
	// 		{ upUntil: 20 / 100, label: 'existential dread' },
	// 		{ upUntil: 33 / 100, label: 'depressed' },
	// 		{ upUntil: 60 / 100, label: 'plagued by guilt' },
	// 		{ upUntil: 90 / 100, label: null },
	// 		{ upUntil: Infinity, label: 'reassured' },
	// 	],
	// },
];
