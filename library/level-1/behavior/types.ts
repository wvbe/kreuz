import Game from '../Game.ts';
import { personArchetype } from '../ecs/archetypes/personArchetype.ts';
import { EcsArchetypeEntity } from '../ecs/types.ts';

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
	entity: EcsArchetypeEntity<typeof personArchetype>;
	game: Game;
};
