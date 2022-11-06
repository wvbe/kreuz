import { type EventedPromise } from '../classes/EventedPromise.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import Game from '../Game.ts';

export interface BehaviorTreeNodeI<B extends Record<string, unknown> = Record<string, never>> {
	type: string;
	evaluate(blackboard: B, provenance?: number[]): EventedPromise;
	label?: string;
	children?: BehaviorTreeNodeI<B>[];
}

export type ExecutionNodeFn<B extends Record<string, unknown>> = (blackboard: B) => EventedPromise;

export type EntityBlackboard = {
	entity: PersonEntity;
	game: Game;
};
