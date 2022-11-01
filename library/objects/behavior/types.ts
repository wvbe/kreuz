import { type EventedPromise } from '../classes/EventedPromise.ts';

export interface BehaviorTreeNode<B extends Record<string, unknown> = Record<string, never>> {
	evaluate(blackboard: B, provenance?: number[]): EventedPromise;
}

export type ExecutionNodeFn<B extends Record<string, unknown>> = (blackboard: B) => EventedPromise;
