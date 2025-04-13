import { Blueprint } from '../../level-1/ecs/components/productionComponent/Blueprint';
import * as materials from '../materials';

export const getWaterFromWell = new Blueprint(
	'Drawing water',
	[],
	[{ material: materials.freshWater, quantity: 3 }],
	{
		workersRequired: 0,
		fullTimeEquivalent: 4500,
		buildingName: 'Water well',
	},
);
