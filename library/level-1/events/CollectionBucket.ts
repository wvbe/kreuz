import { Collection } from './Collection.ts';

/**
 * A collection that is based on (filtering down) a superset {@link Collection} or {@link CollectionBucket}.
 *
 * Using a CollectionBucket is only advantageous if the bucket is queried more often than it is filtered/updated,
 * and/or if multiple systems use it.
 */
export class CollectionBucket<
	SourceGeneric,
	BucketedGeneric extends SourceGeneric = SourceGeneric,
> extends Collection<BucketedGeneric> {
	/**
	 * A collection that is based on (filtering down) a superset {@link Collection} or {@link CollectionBucket}.
	 */
	public constructor(
		superset: Collection<SourceGeneric>,
		filter: (item: SourceGeneric) => item is BucketedGeneric,
	) {
		super();
		this.list.push(...superset.filter(filter));
		superset.$change.on(async ($added, $removed) => {
			const added = $added.filter(filter);
			const removed = $removed.filter(filter);
			await this.change(added, removed);
		});
	}
}
