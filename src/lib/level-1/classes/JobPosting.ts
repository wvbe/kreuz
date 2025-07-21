import { EcsEntity } from '../ecs/types';
import Game from '../Game';

type JobPostingOptions = {
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
export abstract class JobPosting {
	public vacancies: number;

	public readonly options: JobPostingOptions;

	public constructor(options: JobPostingOptions) {
		this.options = options;
		this.vacancies = options.vacancies || 1;
	}

	public scoreForEntity(game: Game, entity: EcsEntity) {
		if (!this.vacancies) {
			return 0;
		}
		return this.onScore(game, entity);
	}

	public async executeWithEntity(game: Game, entity: EcsEntity) {
		if (this.vacancies < 1) {
			throw new Error('Cannot take a job that is already forgiven');
		}
		this.vacancies--;
		await this.onAssign(game, entity);
		if (this.options.restoreVacancyWhenDone) {
			this.vacancies++;
		}
	}

	public get label() {
		return this.options.label;
	}

	/**
	 * The code that runs before a job is posted for workers to discover.
	 */
	abstract onPost(game: Game): void | Promise<void>;

	/**
	 * The code that runs when a worker is assigned to the job. Should start the job, perform
	 * the job, and return or resolve to `Promise<void>` when the job is done.
	 */
	abstract onAssign(game: Game, worker: EcsEntity): void | Promise<void>;

	/**
	 * The code that determines how much of a priority this job is for a given worker.
	 * - Return 0 if the job is not attractive at all or impossible.
	 * - Return 1 if the job is totally attractive, it is the first job this worker would take.
	 */
	abstract onScore(game: Game, worker: EcsEntity): number;
}
