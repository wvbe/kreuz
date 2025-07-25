import { type SelectorNode } from './SelectorNode';
import { type SequenceNode } from './SequenceNode';
import { type BehaviorTreeNodeI, type ExecutionNodeFn } from './types';
/**
 * Will execute a bit of code and return a {@link Promise}.
 *
 * Control flow nodes like {@link SequenceNode} and {@link SelectorNode} will propagate these
 * results in different ways to make the behavior tree complete.
 */
export class ExecutionNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'execution';
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

	public evaluate(blackboard: B, _provenance?: number[]): void | Promise<void> {
		const result = this.#callback(blackboard);
		// const label = result.isBusy ? 'busy' : result.isRejected ? 'rejected' : 'resolved';
		return result;
	}
}
