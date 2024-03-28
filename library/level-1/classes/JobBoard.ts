import { JobPosting } from '../ecs/components/behaviorComponent/JobPosting.ts';
import { Collection } from '../events/Collection.ts';
import { EcsEntity } from '@lib/core';

type JobCandidate = {
	execute: () => Promise<void>;
	score: number;
};

export class JobBoard {
	#global = new Collection<JobPosting>();
	#personal = new Map<EcsEntity, (() => JobCandidate)[]>();

	public addGlobal(job: JobPosting) {
		return this.#global.add(job);
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
				execute: function executeGloballyPostedJob() {
					return job.executeWithEntity(entity);
				},
				score: job.scoreForEntity(entity),
			})),
			...(this.#personal.get(entity) || []),
		];
	}
}
