import { Blueprint } from '../../level-1/ecs/components/productionComponent/Blueprint';
import * as materials from '../materials';

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
