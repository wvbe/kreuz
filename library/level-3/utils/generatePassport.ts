import { type SeedI, type PersonEntityPassportOptions, Random } from '@lib';

import FIRST_NAMES_F from './data/names-female.ts';
import FIRST_NAMES_M from './data/names-male.ts';

export function generatePassport(seed: SeedI[]): PersonEntityPassportOptions {
	const gender = Random.boolean([...seed, 'gender'], 0.5) ? 'm' : 'f';
	const firstName = Random.fromArray(gender === 'm' ? FIRST_NAMES_M : FIRST_NAMES_F, ...seed);

	return {
		gender,
		firstName,
	};
}
