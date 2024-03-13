import { EntityI } from '../entities/types.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { EventedNumericValue } from '../events/EventedNumericValue.ts';
import { BehaviorTreeNodeI, EntityBlackboard } from './types.ts';
import { black } from 'https://deno.land/std@0.106.0/fmt/colors.ts';
import { VendorEntity } from '../../level-2/behavior/reusable/primitives/types.ts';
import { FactoryBuildingEntity } from '../entities/entity.building.factory.ts';

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
	employer: EntityI;
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
		if ((employer as FactoryBuildingEntity).$blueprint) {
			return `${employer}, ${(employer as FactoryBuildingEntity).$blueprint.get()?.name}`;
		}
		return `${employer}`;
	}
}
