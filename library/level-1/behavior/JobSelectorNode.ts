import { SelectorNode } from './SelectorNode.ts';
import { BehaviorError } from './BehaviorError.ts';
import { EntityBlackboard, type BehaviorTreeNodeI } from './types.ts';
import { black } from 'https://deno.land/std@0.106.0/fmt/colors.ts';

/**
 * A variant of {@link SelectorNode}, but chooses jobs based on {@link JobVacancy} desirability
 * instead.
 */
export class JobSelectorNode<B extends EntityBlackboard = EntityBlackboard>
	extends SelectorNode<B>
	implements BehaviorTreeNodeI<B>
{
	/**
	 * This class does not take any constructor arguments. Instead, it will pick a job from the {@Game} job-board.
	 */
	public constructor() {
		super();
	}
	public async evaluate(blackboard: B, _provenance?: number[]): Promise<void> {
		if (!blackboard.game) {
			throw new Error(`The JobSelector BT node can only be used when Game is on the blackboard`);
		}
		if (!blackboard.entity) {
			throw new Error(
				`The JobSelector BT node can only be used when an entity is on the blackboard`,
			);
		}
		let index = 0;
		const vacancies = blackboard.game.jobs
			.map((vacancy) => ({
				vacancy,
				desirability: vacancy.calculateDesirability(blackboard),
			}))
			.filter(({ desirability }) => desirability > 0)
			.sort((a, b) => a.desirability - b.desirability);

		const next = async () => {
			const job = vacancies[index++];
			if (!job) {
				// return prom.reject();
				throw new BehaviorError('No job vacancies to choose from');
			}
			try {
				await job.vacancy.assignJob(blackboard);
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
