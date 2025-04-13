import { BehaviorTreeSignal } from './BehaviorTreeSignal';
import { type BehaviorTreeNodeI } from './types';

/**
 * Inverts the success/fail signal of the behavior tree node that it wraps.
 *
 * Control flow nodes like {@link SequenceNode} and {@link SelectorNode} will propagate these
 * results in different ways to make the behavior tree complete.
 */
export class InverterNode<B extends Record<string, unknown> = Record<string, never>>
	implements BehaviorTreeNodeI<B>
{
	public readonly type = 'inverter';

	public readonly children: BehaviorTreeNodeI<B>[];

	constructor(node: BehaviorTreeNodeI<B>) {
		this.children = [node];
	}

	public async evaluate(blackboard: B, _provenance?: number[]): Promise<void> {
		try {
			await this.children[0].evaluate(blackboard, _provenance);
		} catch (error: Error | BehaviorTreeSignal | unknown) {
			if ((error as BehaviorTreeSignal)?.type !== 'fail') {
				throw error;
			}
			return;
		}
		throw new BehaviorTreeSignal(`A behavior that was expected to fail, succeeded`);
	}
}
