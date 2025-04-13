import { Blueprint } from '../../level-1/ecs/types';
import * as materials from '../materials';

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

export const pancaking = new Blueprint(
	'Making pancakes',
	[
		{ material: materials.flour, quantity: 2 },
		{ material: materials.milk, quantity: 1 },
		{ material: materials.eggs, quantity: 1 },
	],
	[{ material: materials.pancakes, quantity: 2 }],
	{
		workersRequired: 1,
		fullTimeEquivalent: 8000,
		buildingName: 'Pancake house',
	},
);
