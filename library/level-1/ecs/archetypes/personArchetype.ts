import { SimpleCoordinate } from '../../terrain/types.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { behaviorComponent } from '../components/behaviorComponent.ts';
import { BehaviorTreeNodeI, EntityBlackboard } from '../components/behaviorComponent/types.ts';
import { eventLogComponent } from '../components/eventLogComponent.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { needsComponent } from '../components/needsComponent.ts';
import { pathingComponent } from '../components/pathingComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';

export const personArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		name: string;
		icon: string;
		behavior: BehaviorTreeNodeI<EntityBlackboard> | null;
		wealth?: number;
	},
	| typeof behaviorComponent
	| typeof healthComponent
	| typeof inventoryComponent
	| typeof locationComponent
	| typeof needsComponent
	| typeof pathingComponent
	| typeof eventLogComponent
	| typeof visibilityComponent
	| typeof wealthComponent
>(
	[
		behaviorComponent,
		healthComponent,
		inventoryComponent,
		locationComponent,
		needsComponent,
		pathingComponent,
		eventLogComponent,
		wealthComponent,
	],
	(entity, options) => {
		behaviorComponent.attach(entity, {
			behavior: options.behavior,
		});
		healthComponent.attach(entity, {
			health: 1,
		});
		inventoryComponent.attach(entity, {
			maxStackSpace: 6,
		});
		locationComponent.attach(entity, {
			location: options.location,
		});
		needsComponent.attach(entity, {
			hydration: 1,
			nutrition: 1,
		});
		pathingComponent.attach(entity, {
			walkSpeed: 1 / 1000,
		});
		eventLogComponent.attach(entity, {});
		visibilityComponent.attach(entity, {
			name: options.name,
			icon: options.icon,
		});
		wealthComponent.attach(entity, {
			wealth: options.wealth || 0,
		});
	},
);
