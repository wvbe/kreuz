import { EcsEntity } from '../ecs/types';
import { Collection } from '../events/Collection';
import Game from '../Game';
import { JobPosting } from './JobPosting';
import { normalizeWithinPriorityBands } from './util/normalizeWithinPriorityBands';

export type JobCandidate = {
	execute: () => Promise<void>;
	score: number;
	label: string;
};

export enum JobPriority {
	LOW = 1,
	NORMAL = 2,
	HIGH = 3,
}

type PrioritizedJobPosting = { priority: JobPriority; job: JobPosting };

export class JobBoard {
	#posts = new Collection<PrioritizedJobPosting>();
	#personal = new Map<EcsEntity, (() => JobCandidate)[]>();

	constructor(private readonly game: Game) {}

	public async add(priority: JobPriority, job: JobPosting): Promise<void> {
		await job.onPost(this.game);
		await this.#posts.add({ priority, job });
	}

	public async remove(job: JobPosting): Promise<void> {
		const posting = this.#posts.find(({ job: j }) => j === job);
		if (posting) {
			await this.#posts.remove(posting);
		}
	}

	/**
	 * @deprecated For testing purposes only
	 */
	public get globalJobCount() {
		return this.#posts.length;
	}

	/**
	 * @deprecated Should probably reinvent as a nested jobboard
	 */
	public addPersonal(entity: EcsEntity, job: () => JobCandidate) {
		const jobs = this.#personal.get(entity) ?? [];
		jobs.push(job);
		this.#personal.set(entity, jobs);
	}

	/**
	 * @deprecated Should probably reinvent as a nested jobboard
	 */
	public removePersonal(entity: EcsEntity, job: () => JobCandidate) {
		const jobs = this.#personal.get(entity);
		const index = jobs?.indexOf(job) ?? -1;
		if (jobs === undefined || index === -1) {
			throw new Error('This personal job was never registered');
		}
		jobs.splice(index, 1);
	}

	public forEntity(entity: EcsEntity) {
		const scores = this.#posts.slice().map((posting) => ({
			...posting,
			score: posting.job.scoreForEntity(this.game, entity),
		}));
		const normalizedScores = normalizeWithinPriorityBands(scores);
		return scores.map((posting, index) => ({
			execute: () => posting.job.executeWithEntity(this.game, entity),
			score: normalizedScores[index] * posting.priority,
			label: posting.job.label,
		}));
	}
}
