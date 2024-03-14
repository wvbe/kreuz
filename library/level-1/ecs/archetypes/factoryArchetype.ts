import { Blueprint } from '../../inventory/Blueprint.ts';
import { SimpleCoordinate } from '../../types.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { ownerComponent } from '../components/ownerComponent.ts';
import { productionComponent } from '../components/productionComponent.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { EcsEntity } from '../types.ts';

export const factoryArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>;
		blueprint: Blueprint | null;
		maxWorkers: number;
		maxStackSpace: number;
		name?: string;
		icon?: string;
	},
	| typeof inventoryComponent
	| typeof statusComponent
	| typeof locationComponent
	| typeof ownerComponent
	| typeof productionComponent
	| typeof visibilityComponent
>(
	[
		inventoryComponent,
		locationComponent,
		ownerComponent,
		statusComponent,
		productionComponent,
		visibilityComponent,
	],
	(entity, options) => {
		inventoryComponent.attach(entity, {
			maxStackSpace: options.maxStackSpace,
		});
		locationComponent.attach(entity, {
			location: options.location,
		});
		ownerComponent.attach(entity, {
			owner: options.owner,
		});
		statusComponent.attach(entity, {});
		productionComponent.attach(entity, {
			maxWorkers: options.maxWorkers,
			blueprint: options.blueprint,
		});
		visibilityComponent.attach(entity, {
			icon: options.icon ?? '🏭',
			name: options.name ?? 'Factory',
		});
	},
);
