import { Random } from '../classes/Random';
import { SeedI } from '../types';

import namesFemale from './data/names-female.json';
import namesMale from './data/names-male.json';
export const FIRST_NAMES_M = namesFemale;
export const FIRST_NAMES_F = namesMale;

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
	'acre'
];
export function getRandomSettlementName(seed: SeedI[]) {
	return [
		Random.fromArray(SETTLEMENT_PREFIXES, ...seed, 1),
		Random.fromArray(SETTLEMENT_SUFFIXES, ...seed, 2)
	].join('');
}
