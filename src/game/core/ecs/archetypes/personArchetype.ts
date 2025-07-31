import { QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { behaviorComponent } from '../components/behaviorComponent';
import { BehaviorTreeNodeI, EntityBlackboard } from '../components/behaviorComponent/types';
import { eventLogComponent } from '../components/eventLogComponent';
import { healthComponent } from '../components/healthComponent';
import { inventoryComponent } from '../components/inventoryComponent';
import { locationComponent } from '../components/locationComponent';
import { needsComponent } from '../components/needsComponent';
import { pathingComponent } from '../components/pathingComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { wealthComponent } from '../components/wealthComponent';

export const personArchetype = new EcsArchetype<
	{
		location: QualifiedCoordinate;
		name: string;
		icon: string;
		behavior: BehaviorTreeNodeI<EntityBlackboard> | null;
		wealth?: number;
		immortal?: boolean;
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
			initialNeeds: {
				hydration: 1,
				nutrition: 1,
			},
			decayMultiplier: options.immortal ? 0 : 1,
		});
		pathingComponent.attach(entity, {
			walkSpeed: 1 / 1000,
		});
		eventLogComponent.attach(entity, {});
		visibilityComponent.attach(entity, {
			name: options.name,
			icon: options.icon,
			iconSize: 0.8,
			visiblityPriority: 99999,
		});
		wealthComponent.attach(entity, {
			wealth: options.wealth || 0,
		});
	},
);
