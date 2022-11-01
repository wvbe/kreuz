import { EventedPromise } from '../../classes/EventedPromise.ts';
import { type BehaviorTreeNode } from '../types.ts';

/**
 * Will return RUNNING or FAIL as soon as any of its children runs or fails.
 * Needs all of its children to SUCCEED for itself to succeed.
 */
export class SequenceNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNode<B>
{
	public readonly children: BehaviorTreeNode<B>[];
	public constructor(...children: BehaviorTreeNode<B>[]) {
		this.children = children;
	}
	public evaluate(blackboard: B, provenance?: number[]): EventedPromise {
		let index = 0;
		for (const child of this.children) {
			console.log(`${this.constructor.name} child ${index + 1}/${this.children.length}`, child);
			const signal = child.evaluate(blackboard, provenance);
			if (!signal.isResolved) {
				if (provenance) {
					provenance.unshift(index);
				}
				return signal;
			}
			++index;
		}
		return EventedPromise.resolve();
	}
}
