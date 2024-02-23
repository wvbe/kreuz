import { EntityI } from '../entities/types.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { EventedNumericValue } from '../classes/EventedNumericValue.ts';
import { BehaviorTreeNodeI, EntityBlackboard } from './types.ts';
import { black } from 'https://deno.land/std@0.106.0/fmt/colors.ts';

/**
 * A function that scores how desirable a job is for a person:
 *   0 = Not attractive at all or impossible. This worker will never take the job.
 *   1 = Totally attractive, it is the first job this worker would take
 */
type JobVacancyDesirabilityFn = (blackboard: EntityBlackboard) => number;

export class JobVacancy {
	/**
	 * The amount of people that can work this job here.
	 * @TODO Posibly this does not need to be an evented value
	 */
	public $vacancies = new EventedNumericValue(0, 'JobVacancy.$vacancies');

	/**
	 * A function that scores how desirable a job is for a person:
	 *   0 = Not attractive at all or impossible. This worker will never take the job.
	 *   1 = Totally attractive, it is the first job this worker would take
	 */
	public readonly calculateDesirability: JobVacancyDesirabilityFn;

	#performJob: (blackboard: EntityBlackboard) => Promise<void>;

	public constructor(
		vacancies: number,
		calculateDesirability: JobVacancyDesirabilityFn,
		performJob: (blackboard: EntityBlackboard) => Promise<void>,
	) {
		this.$vacancies.set(vacancies, true);
		this.calculateDesirability = calculateDesirability;
		this.#performJob = performJob;
	}

	public async doJob(blackboard: EntityBlackboard) {
		const vacancies = this.$vacancies.get();
		if (vacancies < 1) {
			throw new Error('Cannot take a job that is already forgiven');
		}
		await this.$vacancies.set(vacancies - 1);
		await this.#performJob(blackboard);
		await this.$vacancies.set(vacancies + 1);
	}
}
