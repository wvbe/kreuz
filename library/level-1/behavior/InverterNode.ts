import { EventedPromise } from '../classes/EventedPromise.ts';
import { type BehaviorTreeNodeI } from './types.ts';

/**
 * Will execute a bit of code and return an {@link EventedPromise} that is either running (`.isBusy`),
 * succeeded (`isResolved`) or failed (`isRejected`)
 *
 * Control flow nodes like {@link SequenceNode} and {@link SelectorNode} will propagate these
 * results in different ways to make the behavior tree complete.
 */
export class InverterNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'inverter';

	public readonly children: BehaviorTreeNodeI<B>[];

	constructor(node: BehaviorTreeNodeI<B>) {
		this.children = [node];
	}

	public evaluate(blackboard: B, _provenance?: number[]): EventedPromise {
		const result = this.children[0].evaluate(blackboard, _provenance);
		if (result.isRejected) {
			return EventedPromise.resolve();
		}
		if (result.isResolved) {
			return EventedPromise.reject();
		}
		return result;
	}
}
