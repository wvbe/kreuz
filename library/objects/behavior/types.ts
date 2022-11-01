import { type EventedPromise } from '../classes/EventedPromise.ts';

export interface BehaviorTreeNodeI<B extends Record<string, unknown> = Record<string, never>> {
	type: string;
	evaluate(blackboard: B, provenance?: number[]): EventedPromise;
	label?: string;
	children?: BehaviorTreeNodeI<B>[];
}

export type ExecutionNodeFn<B extends Record<string, unknown>> = (blackboard: B) => EventedPromise;
