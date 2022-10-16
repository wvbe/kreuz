import { SortFn } from '../../mod.ts';
import Logger from '../classes/Logger.ts';
import { Collection } from '../classes/Collection.ts';
import { type JobI } from './types.ts';

type JobPriorityI = {
	job: JobI;
	priority: number;
};

export class JobBoard extends Collection<JobPriorityI> {
	constructor() {
		super();
		this.$add.on(() => this.#reorder());
	}

	#reorder(): void {
		if (!this.length) {
			return;
		}

		const firstAvailableJobIndex = this.find(({ job }) => job.isAvailable());
		this.sort(({ priority: priorityA }, { priority: priorityB }) => priorityA - priorityB);
		if (!firstAvailableJobIndex) {
			// No available jobs, no need to act on reprioritization now.
			return;
		}

		const newFirstAvailableJobIndex = this.find(({ job }) => job.isAvailable()) as JobPriorityI;
		const firstAvailableJobChanged = firstAvailableJobIndex !== newFirstAvailableJobIndex;
		if (firstAvailableJobChanged) {
			Logger.log(
				`Due to changing priorities, ${newFirstAvailableJobIndex.job.label} is now of the utmost importance`,
			);
		}
	}

	public setPriority(job: JobI, priority: number): void {
		const item = this.find((record) => record.job === job);
		if (priority === 0) {
			if (item) {
				this.remove(item);
			}
		} else {
			// Create or update
			if (!item) {
				this.add({ job, priority });
			} else {
				item.priority = priority;
				this.#reorder();
			}
		}
	}

	/**
	 * @deprecated maybe use add() direclty? Dunnow
	 */
	public addJob(job: JobI, priority: number): void {
		this.add({ job, priority });
	}
}
