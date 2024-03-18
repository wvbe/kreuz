import Game from '../../../Game.ts';
import { personArchetype } from '../../archetypes/personArchetype.ts';
import { EcsEntity } from '../../types.ts';
import { EcsArchetypeEntity } from '../../types.ts';
import { behaviorComponent } from '../behaviorComponent.ts';
import { healthComponent } from '../healthComponent.ts';
import { inventoryComponent } from '../inventoryComponent.ts';
import { locationComponent } from '../locationComponent.ts';
import { pathingComponent } from '../pathingComponent.ts';
import { statusComponent } from '../statusComponent.ts';
import { visibilityComponent } from '../visibilityComponent.ts';
import { wealthComponent } from '../wealthComponent.ts';
import { needsComponent } from '../needsComponent.ts';

export interface BehaviorTreeNodeI<
	BlackboardGeneric extends Record<string, unknown> = Record<string, never>,
> {
	type: string;
	evaluate(
		blackboard: BlackboardGeneric,
		/**
		 * @todo probably deprecate "provenance"
		 */
		provenance?: number[],
	): void | Promise<void>;
	label?: string;
	children?: BehaviorTreeNodeI<BlackboardGeneric>[];
}

export type ExecutionNodeFn<B extends Record<string, unknown>> = (
	blackboard: B,
) => void | Promise<void>;

export type EntityBlackboard = {
	entity: EcsEntity;
	game: Game;
};
