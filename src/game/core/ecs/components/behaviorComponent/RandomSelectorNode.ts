import { Random } from '../../../classes/Random';
import { SeedI } from '../../../types';
import { BehaviorTreeSignal } from './BehaviorTreeSignal';
import { SelectorNode } from './SelectorNode';
import { type BehaviorTreeNodeI } from './types';

/**
 * Same as a {@link SelectorNode}, but somewhat randomizes order.
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

	public async evaluate(blackboard: B, provenance?: number[]): Promise<void> {
		const children = this.children.slice();
		const next = async () => {
			if (!children.length) {
				throw new BehaviorTreeSignal('No more child nodes to randomly choose from');
			}
			const child = Random.fromArray(children, ...this.#createSeed(blackboard));
			children.splice(children.indexOf(child), 1);
			try {
				await child.evaluate(blackboard, provenance);
			} catch (error: Error | BehaviorTreeSignal | unknown) {
				if ((error as BehaviorTreeSignal)?.type !== 'fail') {
					throw error;
				}
				await next();
			}
		};
		await next();
	}
}
