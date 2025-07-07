import { EcsEntity } from '../ecs/types';
import { Collection } from '../events/Collection';
import Game from '../Game';
import { JobPosting } from './JobPosting';

export type JobCandidate = {
	execute: () => Promise<void>;
	score: number;
	label: string;
};

export class JobBoard {
	#global = new Collection<JobPosting>();
	#personal = new Map<EcsEntity, (() => JobCandidate)[]>();

	constructor(private readonly game: Game) {}

	public async addGlobal(job: JobPosting) {
		job.onPost(this.game);
		return this.#global.add(job);
	}

	/**
	 * @deprecated For testing purposes only
	 */
	public get globalJobCount() {
		return this.#global.length;
	}

	public removeGlobal(job: JobPosting) {
		return this.#global.remove(job);
	}

	public addPersonal(entity: EcsEntity, job: () => JobCandidate) {
		const jobs = this.#personal.get(entity) ?? [];
		jobs.push(job);
		this.#personal.set(entity, jobs);
	}

	public removePersonal(entity: EcsEntity, job: () => JobCandidate) {
		const jobs = this.#personal.get(entity);
		const index = jobs?.indexOf(job) ?? -1;
		if (jobs === undefined || index === -1) {
			throw new Error('This personal job was never registered');
		}
		jobs.splice(index, 1);
	}

	public forEntity(entity: EcsEntity) {
		return [
			...this.#global.map((job) => () => ({
				execute: () => job.executeWithEntity(this.game, entity),
				score: job.scoreForEntity(this.game, entity),
				label: job.label,
			})),
			...(this.#personal.get(entity) || []),
		];
	}
}
