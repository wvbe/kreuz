import { Blueprint } from '../../level-1/mod.ts';
import * as materials from '../materials.ts';

export const growWheat = new Blueprint(
	'Growing wheat',
	[],
	[{ material: materials.wheat, quantity: 1 }],
	{
		workersRequired: 1,
		fullTimeEquivalent: 10000,
		buildingName: 'Wheat farm',
	},
);

export const wheatProcessing = new Blueprint(
	'Grinding wheat',
	[{ material: materials.wheat, quantity: 2 }],
	[
		{ material: materials.flour, quantity: 1 },
		{ material: materials.bran, quantity: 1 },
	],
	{
		workersRequired: 1,
		fullTimeEquivalent: 5000,
		buildingName: 'Mill',
	},
);
