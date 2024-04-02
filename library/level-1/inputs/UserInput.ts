import { JobPosting } from '../ecs/components/behaviorComponent/JobPosting.ts';

/**
 * A class that remembers user inputs (or rather, the actions that follow), and may provide an API
 * to cancel them, monitor their progress, etc
 *
 * Any user input that is handled instantly will not be managed through here.
 */
export class UserInput {
	#queue: JobPosting[] = [];
	public queueJob(job: JobPosting) {
		this.#queue.push(job);
	}
}
