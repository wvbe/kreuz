import { productionComponent } from '../ecs/components/productionComponent.ts';
import { EcsEntity } from '../ecs/types.ts';

import { EntityBlackboard } from './types.ts';

/**
 * A function that scores how desirable a job is for a person:
 *   0 = Not attractive at all or impossible. This worker will never take the job.
 *   1 = Totally attractive, it is the first job this worker would take
 */
type JobVacancyDesirabilityFn = (blackboard: EntityBlackboard) => number;

type JobVacancyOptions = {
	/**
	 * A function that scores how desirable a job is for a person:
	 *   0 = Not attractive at all or impossible. This worker will never take the job.
	 *   1 = Totally attractive, it is the first job this worker would take
	 */
	score: JobVacancyDesirabilityFn;
	/**
	 * The amount of people that can work this job here.
	 */
	vacancies: number;

	/**
	 * Useful for cosmetic reasons, but not used in any of the actual computation (???)
	 */
	employer: EcsEntity<typeof productionComponent>;
};
export class JobVacancy {
	#onAssign: (blackboard: EntityBlackboard) => Promise<void>;
	public vacancies: number;

	#options: JobVacancyOptions;

	public constructor(
		onAssign: (blackboard: EntityBlackboard) => Promise<void>,
		options: JobVacancyOptions,
	) {
		this.#onAssign = onAssign;
		this.#options = options;
		this.vacancies = options.vacancies || 1;
	}

	public score(blackboard: EntityBlackboard) {
		return this.#options.score(blackboard);
	}

	public async doJob(blackboard: EntityBlackboard) {
		if (this.vacancies < 1) {
			throw new Error('Cannot take a job that is already forgiven');
		}
		this.vacancies--;
		await this.#onAssign(blackboard);
		this.vacancies++;
	}

	public get label() {
		const employer = this.#options.employer;
		if (!employer) {
			return 'Unknown job';
		}
		if (productionComponent.test(employer)) {
			return `${employer}, ${
				(employer as EcsEntity<typeof productionComponent>).$blueprint.get()?.name
			}`;
		}
		return `${employer}`;
	}
}
