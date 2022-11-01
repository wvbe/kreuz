import { EventedPromise } from '../../classes/EventedPromise.ts';
import { type BehaviorTreeNodeI } from '../types.ts';

/**
 * Will return RUNNING or FAIL as soon as any of its children runs or fails.
 * Needs all of its children to SUCCEED for itself to succeed.
 */
export class SequenceNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'sequence';

	public readonly children: BehaviorTreeNodeI<B>[];

	public constructor(...children: BehaviorTreeNodeI<B>[]) {
		this.children = children;
	}

	public evaluate(blackboard: B, provenance?: number[]): EventedPromise {
		const prom = new EventedPromise();
		let index = 0;
		const next = () => {
			const child = this.children[index++];
			if (!child) {
				return prom.resolve();
			}
			const p = child.evaluate(blackboard, provenance);
			p.then(next, prom.reject.bind(prom));
		};
		console.group('→');
		next();
		console.groupEnd();
		return prom;
	}
}
