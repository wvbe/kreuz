import { type SeedI, Random } from '@lib';

import FIRST_NAMES_F from './data/names-female.ts';
import FIRST_NAMES_M from './data/names-male.ts';
import { ICONS_MALE, ICONS_FEMALE } from './data/icons.ts';

export function generatePassport(seed: SeedI[]) {
	const gender = Random.boolean([...seed, 'gender'], 0.5) ? 'm' : 'f';
	const icon = Random.fromArray(gender === 'm' ? ICONS_MALE : ICONS_FEMALE, ...seed);
	const name = Random.fromArray(gender === 'm' ? FIRST_NAMES_M : FIRST_NAMES_F, ...seed);
	return { name, icon };
}
