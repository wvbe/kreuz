import { EventedPromise } from '../../classes/EventedPromise.ts';
import { type BehaviorTreeNodeI } from '../types.ts';

/**
 * Will return RUNNING or SUCCESS as soon as any of its children runs or succeeds.
 * Needs all children to FAIL for itself to fail.
 */
export class SelectorNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'selector';

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
				return prom.reject();
			}
			const p = child.evaluate(blackboard, provenance);
			p.then(prom.resolve.bind(prom), next);
		};
		console.group('?');
		next();
		console.groupEnd();
		return prom;
	}
}
