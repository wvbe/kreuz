import { EventedPromise } from '../../classes/EventedPromise.ts';
import { type ExecutionNodeFn, type BehaviorTreeNode } from '../types.ts';

/**
 * Will execute a bit of code and return an {@link EventedPromise} that is either running (`.isBusy`),
 * succeeded (`isResolved`) or failed (`isRejected`)
 *
 * Control flow nodes like {@link SequenceNode} and {@link SelectorNode} will propagate these
 * results in different ways to make the behavior tree complete.
 */
export class ExecutionNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNode<B>
{
	public readonly label?: string;
	#callback: ExecutionNodeFn<B>;

	// constructor(callback: ExecutionNodeFn<B>);
	constructor(label: string, callback: ExecutionNodeFn<B>);
	constructor(labelOrCallback: string | ExecutionNodeFn<B>, callback?: ExecutionNodeFn<B>) {
		if (typeof labelOrCallback === 'string' && callback) {
			this.label = labelOrCallback;
			this.#callback = callback;
		} else if (typeof labelOrCallback === 'function') {
			this.#callback = labelOrCallback;
		} else {
			// Programmer error:
			throw new Error('Invalid arguments');
		}
	}

	public evaluate(blackboard: B, _provenance?: number[]): EventedPromise {
		return this.#callback(blackboard);
	}
}
