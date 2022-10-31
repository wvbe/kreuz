import { EventedPromise } from '../../classes/EventedPromise.ts';
import { type BehaviorTreeNode } from './types.ts';

/**
 * Will return RUNNING or SUCCESS as soon as any of its children runs or succeeds.
 * Needs all children to FAIL for itself to fail.
 */
export class SelectorNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNode<B>
{
	public readonly children: BehaviorTreeNode<B>[];
	public constructor(...children: BehaviorTreeNode<B>[]) {
		this.children = children;
	}
	public evaluate(blackboard: B, provenance?: number[]): EventedPromise {
		let index = 0;
		for (const child of this.children) {
			const signal = child.evaluate(blackboard, provenance);
			if (!signal.isRejected) {
				if (provenance) {
					provenance.unshift(index);
				}
				return signal;
			}
			++index;
		}
		return EventedPromise.reject();
	}
}
