import { type Need } from '../ecs/components/needs/Need';
import { DAY } from '../time/constants';

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
		// It takes 14 days to become completely malnutritioned:
		decay: -1 / (14 * DAY),
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
		// It takes 3 days to become completely dehydrated:
		decay: -1 / (3 * DAY),
		moods: [
			{ upUntil: 5 / 100, label: 'dying from dehydration' },
			{ upUntil: 15 / 100, label: 'parched' },
			{ upUntil: 30 / 100, label: 'thirsty' },
			{ upUntil: 75 / 100, label: null },
			{ upUntil: 90 / 100, label: 'feeling refreshed' },
			{ upUntil: Infinity, label: 'had too much' },
		],
	},
];
