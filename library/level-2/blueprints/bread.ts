import { Blueprint } from '@lib/core';
import * as materials from '../materials.ts';

export const milling = new Blueprint(
	'Milling wheat',
	[{ material: materials.wheat, quantity: 3 }],
	[
		{ material: materials.flour, quantity: 1 },
		{ material: materials.bran, quantity: 2 },
	],
	{
		workersRequired: 1,
		fullTimeEquivalent: 5000,
		buildingName: 'Mill',
	},
);

export const breadBaking = new Blueprint(
	'Baking bread',
	[
		{ material: materials.flour, quantity: 2 },
		{ material: materials.freshWater, quantity: 1 },
	],
	[{ material: materials.bread, quantity: 1 }],
	{
		workersRequired: 1,
		fullTimeEquivalent: 5000,
		buildingName: 'Bakery',
	},
);
