import { Random } from '../../../classes/Random.ts';
import { SeedI } from '../../../types.ts';
import { BehaviorTreeSignal } from './BehaviorTreeSignal.ts';
import { SelectorNode } from './SelectorNode.ts';
import { type BehaviorTreeNodeI } from './types.ts';

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
