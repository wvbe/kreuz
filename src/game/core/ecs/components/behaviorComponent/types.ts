import type Game from '../../../Game';
import { type EcsComponent } from '../../classes/EcsComponent';
import { type EcsEntity } from '../../types';
import { type eventLogComponent } from '../eventLogComponent';

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
	entity: EcsEntity<EcsComponent, typeof eventLogComponent>;
	game: Game;
};
