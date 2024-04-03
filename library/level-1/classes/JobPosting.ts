import { productionComponent } from '../ecs/components/productionComponent.ts';
import { EcsEntity } from '../ecs/types.ts';

/**
 * A function that scores how desirable a job is for a person:
 *   0 = Not attractive at all or impossible. This worker will never take the job.
 *   1 = Totally attractive, it is the first job this worker would take
 */
type JobPostingDesirabilityFn = (entity: EcsEntity) => number;

type JobPostingOptions = {
	/**
	 * A function that scores how desirable a job is for a person:
	 *   0 = Not attractive at all or impossible. This worker will never take the job.
	 *   1 = Totally attractive, it is the first job this worker would take
	 */
	score: JobPostingDesirabilityFn;
	/**
	 * The amount of people that can work this job here.
	 */
	vacancies: number;

	/**
	 * Wether or not a new vacancy opens up when the job is done and the last worker leaves.
	 */
	restoreVacancyWhenDone: boolean;

	/**
	 * Useful for cosmetic reasons, but not used in any of the actual computation.
	 */
	label: string;
};

/**
 * A job for any capable (but as of yet unknown) {@link EcsEntity} to pick up.
 */
export class JobPosting {
	#onAssign: (job: this, entity: EcsEntity) => Promise<void>;

	public vacancies: number;

	public readonly options: JobPostingOptions;

	public constructor(
		onAssign: (job: JobPosting, entity: EcsEntity) => Promise<void>,
		options: JobPostingOptions,
	) {
		this.#onAssign = onAssign;
		this.options = options;
		this.vacancies = options.vacancies || 1;
	}

	public scoreForEntity(entity: EcsEntity) {
		if (!this.vacancies) {
			return 0;
		}
		return this.options.score(entity);
	}

	public async executeWithEntity(entity: EcsEntity) {
		if (this.vacancies < 1) {
			throw new Error('Cannot take a job that is already forgiven');
		}
		this.vacancies--;
		await this.#onAssign(this, entity);
		if (this.options.restoreVacancyWhenDone) {
			this.vacancies++;
		}
	}

	public get label() {
		return this.options.label;
	}
}
