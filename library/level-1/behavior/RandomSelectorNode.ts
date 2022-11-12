import { EventedPromise } from '../classes/EventedPromise.ts';
import { Random } from '../classes/Random.ts';
import { SeedI } from '../types.ts';
import { SelectorNode } from './SelectorNode.ts';
import { type BehaviorTreeNodeI } from './types.ts';

/**
 * Same as a SelectorNode, but somewhat randomizes order.
 */
export class RandomSelectorNode<B extends Record<string, unknown> = Record<string, never>>
	extends SelectorNode<B>
	implements BehaviorTreeNodeI<B>
{
	#createSeed: (blackboard: B) => SeedI[];

	public constructor(
		createSeedFromBlackboard: (blackboard: B) => SeedI[],
		...children: BehaviorTreeNodeI<B>[]
	) {
		super(...children);
		this.#createSeed = createSeedFromBlackboard;
	}

	public evaluate(blackboard: B, provenance?: number[]): EventedPromise {
		const prom = new EventedPromise();
		const children = this.children.slice();
		const next = () => {
			if (!children.length) {
				return prom.reject();
			}
			const child = Random.fromArray(children, ...this.#createSeed(blackboard));
			children.splice(children.indexOf(child), 1);
			child.evaluate(blackboard, provenance).then(prom.resolve.bind(prom), next);
		};
		next();
		return prom;
	}
}
