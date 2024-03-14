import { Material } from '../../inventory/Material.ts';
import { SimpleCoordinate } from '../../types.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { ownerComponent } from '../components/ownerComponent.ts';
import { resellerComponent } from '../components/resellerComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { EcsEntity } from '../types.ts';

export const marketArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		owner: EcsEntity<typeof wealthComponent | typeof inventoryComponent>;
		materials: Material[];
		maxStackSpace: number;
		name?: string;
		icon?: string;
	},
	| typeof inventoryComponent
	| typeof locationComponent
	| typeof ownerComponent
	| typeof resellerComponent
	| typeof visibilityComponent
>(
	[inventoryComponent, locationComponent, ownerComponent, resellerComponent, visibilityComponent],
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
		resellerComponent.attach(entity, {
			materials: options.materials,
		});
		visibilityComponent.attach(entity, {
			icon: options.icon ?? '🏪',
			name: options.name ?? 'Market',
		});
	},
);
