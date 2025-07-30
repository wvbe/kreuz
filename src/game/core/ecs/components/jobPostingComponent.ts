import { JobPosting } from '../../classes/JobPosting';
import { Collection } from '../../events/Collection';
import { EcsComponent } from '../classes/EcsComponent';
import { Inventory } from './inventoryComponent/Inventory';

/**
 * Entities with this component are like a jobboard. They can have multiple job postings on them.
 * Entities that want to work need to go to an entity with this component and take a job from
 * `jobPostings`.
 */
export const jobPostingComponent = new EcsComponent<
	{},
	{
		/**
		 * The {@link Inventory} that this entity has on them.
		 */
		jobPostings: Collection<JobPosting>;
	}
>(
	(entity) => entity.jobPostings instanceof Collection,
	(entity, options) => {
		entity.jobPostings = new Collection<JobPosting>();
	},
);
