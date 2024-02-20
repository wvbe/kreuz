import { Blueprint } from '../../level-1/mod.ts';
import * as materials from '../materials.ts';

export const beeKeeping = new Blueprint(
	'Bee-keeping',
	[],
	[{ material: materials.honey, quantity: 2 }],
	{
		fullTimeEquivalent: 8000,
		buildingName: 'Apiary',
	},
);

export const chickenCoop = new Blueprint(
	'Keeping chickens',
	[{ material: materials.bran, quantity: 5 }],
	[{ material: materials.eggs, quantity: 5 }],
	{
		workersRequired: 0,
		fullTimeEquivalent: 12000,
		buildingName: 'Chicken coop',
	},
);
