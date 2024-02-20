import { Blueprint } from '../../level-1/mod.ts';
import * as materials from '../materials.ts';

export const ironOreMining = new Blueprint(
	'Mining iron ore',
	[],
	[{ material: materials.rawIronOre, quantity: 1 }],
	{
		workersRequired: 3,
		fullTimeEquivalent: 13000,
		buildingName: 'Iron mine',
	},
);

export const copperOreMining = new Blueprint(
	'Mining copper ore',
	[],
	[{ material: materials.rawCopperOre, quantity: 1 }],
	{
		workersRequired: 3,
		fullTimeEquivalent: 13000,
		buildingName: 'Copper mine',
	},
);

export const tinOreMining = new Blueprint(
	'Mining tin ore',
	[],
	[{ material: materials.rawTinOre, quantity: 1 }],
	{
		workersRequired: 3,
		fullTimeEquivalent: 13000,
		buildingName: 'Tin mine',
	},
);
