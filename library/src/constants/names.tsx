import { Random } from '../classes/Random.ts';
import { SeedI } from '../types.ts';

import namesFemale from './data/names-female.ts';
import namesMale from './data/names-male.ts';
export const FIRST_NAMES_M = namesMale;
export const FIRST_NAMES_F = namesFemale;

const SETTLEMENT_PREFIXES = ['Tool', 'Rap', 'Murder', 'Thief', 'Apple', 'Banana', 'Copy', 'Cop'];
const SETTLEMENT_SUFFIXES = [
	'town',
	' Town',
	'ville',
	'burgh',
	'burough',
	'view',
	'wall',
	'beach',
	'acre',
];
export function getRandomSettlementName(seed: SeedI[]) {
	return [
		Random.fromArray(SETTLEMENT_PREFIXES, ...seed, 1),
		Random.fromArray(SETTLEMENT_SUFFIXES, ...seed, 2),
	].join('');
}
