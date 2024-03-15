import { SimpleCoordinate } from '../../types.ts';
import { EcsArchetype } from '../classes/EcsArchetype.ts';
import { behaviorComponent } from '../components/behaviorComponent.ts';
import { healthComponent } from '../components/healthComponent.ts';
import { inventoryComponent } from '../components/inventoryComponent.ts';
import { locationComponent } from '../components/locationComponent.ts';
import { needsComponent } from '../components/needsComponent.ts';
import { pathingComponent } from '../components/pathingComponent.ts';
import { statusComponent } from '../components/statusComponent.ts';
import { visibilityComponent } from '../components/visibilityComponent.ts';
import { wealthComponent } from '../components/wealthComponent.ts';

export const personArchetype = new EcsArchetype<
	{
		location: SimpleCoordinate;
		name: string;
		icon: string;
	},
	| typeof behaviorComponent
	| typeof healthComponent
	| typeof inventoryComponent
	| typeof locationComponent
	| typeof needsComponent
	| typeof pathingComponent
	| typeof statusComponent
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
		statusComponent,
		wealthComponent,
	],
	(entity, options) => {
		behaviorComponent.attach(entity, {
			// behavior: null,
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
			energy: 1,
			hydration: 1,
			hygiene: 1,
			ideology: 1,
			nutrition: 1,
		});
		pathingComponent.attach(entity, {
			walkSpeed: 1 / 1000,
		});
		statusComponent.attach(entity, {});
		visibilityComponent.attach(entity, {
			name: options.name,
			icon: options.icon,
		});
		wealthComponent.attach(entity, {
			wealth: 0,
		});
	},
);
