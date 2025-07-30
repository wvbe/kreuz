import { Random } from '../../core/classes/Random';
import { SeedI } from '../../core/types';

import { ICONS_FEMALE, ICONS_MALE } from './data/icons';
import FIRST_NAMES_F from './data/names-female';
import FIRST_NAMES_M from './data/names-male';

export function generatePassport(seed: SeedI[]) {
	const gender = Random.boolean([...seed, 'gender'], 0.5) ? 'm' : 'f';
	const icon = Random.fromArray(gender === 'm' ? ICONS_MALE : ICONS_FEMALE, ...seed);
	const name = Random.fromArray(gender === 'm' ? FIRST_NAMES_M : FIRST_NAMES_F, ...seed);
	return { name, icon };
}
