import { BehaviorTreeSignal } from './BehaviorTreeSignal.ts';
import { type BehaviorTreeNodeI } from './types.ts';

/**
 * Will return RUNNING or FAIL as soon as any of its children runs or fails.
 * When a child fails, stops completely. Needs all of its children to SUCCEED for itself to succeed.
 */
export class SequenceNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'sequence';

	public readonly children: BehaviorTreeNodeI<B>[];

	public constructor(...children: BehaviorTreeNodeI<B>[]) {
		this.children = children;
	}

	public async evaluate(blackboard: B, provenance?: number[]): Promise<void> {
		let index = 0;
		const next = async () => {
			const child = this.children[index++];
			if (!child) {
				// return prom.resolve();
				throw new BehaviorTreeSignal('No child nodes to sequence from');
			}
			await child.evaluate(blackboard, provenance);
			await next();
		};
		await next();
	}
}
