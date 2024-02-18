import { Random } from '../../level-1/classes/Random.ts';
import { SeedI } from '../../level-1/types.ts';
import namesFemale from './data/names-female.ts';
import namesMale from './data/names-male.ts';

export const FIRST_NAMES_M = namesMale;

export const FIRST_NAMES_F = namesFemale;

const SETTLEMENT_PREFIXES = [
	'Apple',
	'Banana',
	'Barrel',
	'Church',
	'Cop',
	'Copy',
	'Kitten',
	'Kitty',
	'Muffin',
	'Murder',
	'Peanut',
	'Potato',
	'Puppy',
	'Rabbit',
	'Rap',
	'Thief',
	'Tiger',
	'Tool',
	'Wood',
];
const SETTLEMENT_SUFFIXES = [
	' Town',
	'acre',
	'beach',
	'burgh',
	'bury',
	'by',
	'ford',
	'ham',
	'stead',
	'ton',
	'worth',
	'burough',
	'dorff',
	'field',
	'hill',
	'shire',
	'stad',
	'town',
	'view',
	'ville',
	'wall',
];
export function getRandomSettlementName(seed: SeedI[]) {
	return [
		Random.fromArray(SETTLEMENT_PREFIXES, ...seed, 1),
		Random.fromArray(SETTLEMENT_SUFFIXES, ...seed, 2),
	].join('');
}
