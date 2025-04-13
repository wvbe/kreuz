import { Blueprint } from '../../level-1/ecs/types';
import * as materials from '../materials';

export const ironIngotProduction = new Blueprint(
	'Making iron ingots',
	[{ material: materials.rawIronOre, quantity: 3 }],
	[{ material: materials.ironIngot, quantity: 1 }],
	{
		workersRequired: 2,
		fullTimeEquivalent: 5000,
		buildingName: 'Iron foundry',
	},
);

export const copperIngotProduction = new Blueprint(
	'Making copper ingots',
	[{ material: materials.rawCopperOre, quantity: 3 }],
	[{ material: materials.copperIngot, quantity: 1 }],
	{
		workersRequired: 2,
		fullTimeEquivalent: 5000,
		buildingName: 'Copper foundry',
	},
);

export const tinIngotProduction = new Blueprint(
	'Making tin ingots',
	[{ material: materials.rawTinOre, quantity: 3 }],
	[{ material: materials.tinIngot, quantity: 1 }],
	{
		workersRequired: 2,
		fullTimeEquivalent: 5000,
		buildingName: 'Tin foundry',
	},
);

export const bronzeIngotProduction = new Blueprint(
	'Making bronze ingots',
	[
		{ material: materials.copperIngot, quantity: 5 },
		{ material: materials.tinIngot, quantity: 1 },
	],
	[{ material: materials.bronzeIngot, quantity: 6 }],
	{
		workersRequired: 2,
		fullTimeEquivalent: 5000,
		buildingName: 'Bronze foundry',
	},
);
