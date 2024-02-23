import { EntityI } from '../entities/types.ts';
import { PersonEntity } from '../entities/entity.person.ts';
import { EventedNumericValue } from '../classes/EventedNumericValue.ts';
import { BehaviorTreeNodeI, EntityBlackboard } from './types.ts';

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

	#executionNode: BehaviorTreeNodeI<EntityBlackboard>;

	public constructor(
		vacancies: number,
		calculateDesirability: JobVacancyDesirabilityFn,
		executionNode: BehaviorTreeNodeI<EntityBlackboard>,
	) {
		this.$vacancies.set(vacancies, true);
		this.calculateDesirability = calculateDesirability;
		this.#executionNode = executionNode;
	}

	public assignJob(blackboard: EntityBlackboard) {
		const vacancies = this.$vacancies.get();
		if (vacancies < 1) {
			throw new Error('Cannot take a job that is already forgiven');
		}
		// @TODO start job on entity
		this.$vacancies.set(vacancies - 1);
		// @TODO clean up the whole JobVacancy instance when?
	}

	public addVacancy() {
		const vacancies = this.$vacancies.get();
		this.$vacancies.set(vacancies + 1);
	}
}
