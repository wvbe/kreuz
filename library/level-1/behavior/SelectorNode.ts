import { BehaviorError } from './BehaviorError.ts';
import { type BehaviorTreeNodeI } from './types.ts';

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

	public async evaluate(blackboard: B, provenance?: number[]): Promise<void> {
		let index = 0;
		const next = async () => {
			const child = this.children[index++];
			if (!child) {
				// return prom.reject();
				throw new BehaviorError('No child nodes to choose from');
			}
			try {
				await child.evaluate(blackboard, provenance);
			} catch (error: Error | BehaviorError | unknown) {
				if ((error as BehaviorError)?.type !== 'behavior') {
					throw error;
				}
				await next();
			}
		};
		await next();
	}
}
