import { Need } from '../entities/Need.ts';

export type PersonNeedId = 'food' | 'water' | 'sleep' | 'hygiene' | 'spirituality';

export type PersonNeedMap = Record<PersonNeedId, Need>;

export const PERSON_NEEDS: Array<{
	id: PersonNeedId;
	label: string;
	decay: number;
	moods: Array<{ upUntil: number; label: string | null }>;
}> = [
	{
		id: 'food',
		label: 'Food',
		decay: 1 / 150_000,
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
		id: 'water',
		label: 'Water',
		decay: 1 / 100_000,
		moods: [
			{ upUntil: 5 / 100, label: 'dying from dehydration' },
			{ upUntil: 15 / 100, label: 'parched' },
			{ upUntil: 30 / 100, label: 'thirsty' },
			{ upUntil: 75 / 100, label: null },
			{ upUntil: 90 / 100, label: 'feeling refreshed' },
			{ upUntil: Infinity, label: 'had too much' },
		],
	},
	{
		id: 'sleep',
		label: 'Sleep',
		decay: 1 / 130_000,
		moods: [
			{ upUntil: 5 / 100, label: 'passing out' },
			{ upUntil: 15 / 100, label: 'very tired' },
			{ upUntil: 30 / 100, label: "lil' sleepy" },
			{ upUntil: 75 / 100, label: null },
			{ upUntil: 90 / 100, label: 'rested' },
			{ upUntil: Infinity, label: 'rejuvenated' },
		],
	},
	{
		id: 'hygiene',
		label: 'Hygiene',
		decay: 1 / 250_000,
		moods: [],
	},
	{
		id: 'spirituality',
		label: 'Spirituality',
		decay: 1 / 1_000_000,
		moods: [],
	},
];
