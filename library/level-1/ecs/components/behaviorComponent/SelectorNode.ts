import { BehaviorTreeSignal } from './BehaviorTreeSignal.ts';
import { type BehaviorTreeNodeI } from './types.ts';

/**
 * Walk all child nodes from start to finish. Will return RUNNING or SUCCESS as soon as any of its
 * children runs or succeeds. When a child fails, will move on to the next child. Needs all
 * children to FAIL for itself to fail.
 */
export class SelectorNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'selector';

	public readonly children: BehaviorTreeNodeI<B>[];

	public constructor(...children: BehaviorTreeNodeI<B>[]) {
		this.children = children;
	}

	public async evaluate(blackboard: B, provenance?: number[]): Promise<void> {
		let index = 0;
		const next = async () => {
			const child = this.children[index++];
			if (!child) {
				// return prom.reject();
				throw new BehaviorTreeSignal('No child nodes to choose from');
			}
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
