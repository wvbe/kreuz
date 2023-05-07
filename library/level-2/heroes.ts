import { HeroPersonEntity } from '../level-1/mod.ts';

export const headOfState = new HeroPersonEntity(
	'King',
	'$$$ king',
	{ x: 0, y: 0, z: Infinity },
	{
		gender: 'm',
		firstName: 'Richard',
	},
);
