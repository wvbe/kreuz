import { HeroPersonEntity } from '../level-1.ts';

export const headOfState = new HeroPersonEntity(
	'King',
	'$$$ king',
	{ x: 0, y: 0, z: Infinity },
	{
		gender: 'm',
		firstName: 'Richard',
	},
);

(self as any).king = headOfState;
