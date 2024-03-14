import { EcsComponent } from '../classes/EcsComponent.ts';
import { EcsEntity } from '../types.ts';
import { inventoryComponent } from './inventoryComponent.ts';
import { wealthComponent } from './wealthComponent.ts';

export const ownerComponent = new EcsComponent<{
	owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>;
}>(
	(entity) =>
		!!entity.owner && wealthComponent.test(entity.owner) && inventoryComponent.test(entity.owner),
);
