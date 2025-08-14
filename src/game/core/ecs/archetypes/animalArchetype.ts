import { cattleBehavior } from '../../../assets/behavior/trees/cattleBehavior';
import { QualifiedCoordinate } from '../../terrain/types';
import { EcsArchetype } from '../classes/EcsArchetype';
import { behaviorComponent } from '../components/behaviorComponent';
import { eventLogComponent } from '../components/eventLogComponent';
import { healthComponent } from '../components/healthComponent';
import { inventoryComponent } from '../components/inventoryComponent';
import { locationComponent } from '../components/locationComponent';
import { needsComponent } from '../components/needsComponent';
import { pathingComponent } from '../components/pathingComponent';
import { visibilityComponent } from '../components/visibilityComponent';
import { wealthComponent } from '../components/wealthComponent';

export enum AnimalArchetypeType {
	DOG = 'dog',
	CAT = 'cat',
	COW = 'cow',
	CHICKEN = 'chicken',
	DUCK = 'duck',
	GOAT = 'goat',
	MOUSE = 'mouse',
}

function getAnimalIcon(type: AnimalArchetypeType) {
	switch (type) {
		case AnimalArchetypeType.DOG:
			return '🐶';
		case AnimalArchetypeType.CAT:
			return '🐱';
		case AnimalArchetypeType.COW:
			return '🐮';
		case AnimalArchetypeType.CHICKEN:
			return '🐔';
		case AnimalArchetypeType.DUCK:
			return '🦆';
		case AnimalArchetypeType.GOAT:
			return '🐐';
		case AnimalArchetypeType.MOUSE:
			return '🐭';
	}
}

type AnimalVariables = {
	icon: string;
	walkSpeed: number;
	/**
	 * A higher number means slower decay of needs, leading to a longer life in case of crisis.
	 */
	resilience: number;
};
function getVariablesForAnimalType(type: AnimalArchetypeType): AnimalVariables {
	switch (type) {
		case AnimalArchetypeType.DOG:
			return {
				icon: '🐶',
				walkSpeed: 1 / 500,
				resilience: 2,
			};
		case AnimalArchetypeType.CAT:
			return {
				icon: '🐱',
				walkSpeed: 1 / 200,
				resilience: 1.5,
			};
		case AnimalArchetypeType.COW:
			return {
				icon: '🐮',
				walkSpeed: 1 / 2000,
				resilience: 1,
			};
		case AnimalArchetypeType.CHICKEN:
			return {
				icon: '🐔',
				walkSpeed: 1 / 500,
				resilience: 0.5,
			};
		case AnimalArchetypeType.DUCK:
			return {
				icon: '🦆',
				walkSpeed: 1 / 700,
				resilience: 0.9,
			};
		case AnimalArchetypeType.GOAT:
			return {
				icon: '🐐',
				walkSpeed: 1 / 1000,
				resilience: 1.2,
			};
		case AnimalArchetypeType.MOUSE:
			return {
				icon: '🐭',
				walkSpeed: 1 / 200,
				resilience: 1.4,
			};
		default:
			throw new Error(`Unknown animal type: ${type}`);
	}
}

export const animalArchetype = new EcsArchetype<
	{
		location: QualifiedCoordinate;
		name: string;
		type: AnimalArchetypeType;
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
		locationComponent,
		needsComponent,
		pathingComponent,
		eventLogComponent,
	],
	(entity, options) => {
		const animal = getVariablesForAnimalType(options.type);

		behaviorComponent.attach(entity, {
			behavior: cattleBehavior,
		});

		healthComponent.attach(entity, {
			health: 1,
		});

		locationComponent.attach(entity, {
			location: options.location,
		});

		needsComponent.attach(entity, {
			initialNeeds: {
				hydration: 1,
				nutrition: 1,
			},
			decayMultiplier: options.immortal ? 0 : 1 / animal.resilience,
		});

		pathingComponent.attach(entity, {
			walkSpeed: animal.walkSpeed,
		});

		eventLogComponent.attach(entity, {});

		visibilityComponent.attach(entity, {
			name: options.name,
			icon: animal.icon,
			iconSize: 0.7,
			visiblityPriority: 99990,
		});
	},
);
