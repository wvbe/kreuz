import { EntityI } from '../mod.ts';

type BucketToItemMap = {
	entity: EntityI;
};

type BucketName = keyof BucketToItemMap;

type Item<Key extends BucketName> = BucketToItemMap[Key];

export type ReplacementBuckets = Record<BucketName, (id: string) => Item<BucketName> | null>;

export function token(bucket: BucketName, item: Item<BucketName>): string {
	return `#{${bucket}:${item.id}}`;
}

export function replace(
	buckets: ReplacementBuckets,
	phrase: string,
): Array<string | Item<BucketName>> {
	const regex = /#\{([^:]*):([^}]*)\}/g;
	const results: Array<string | Item<BucketName>> = [];

	let trailingIndex = 0;
	let match;
	while ((match = regex.exec(phrase))) {
		const [token, bucket, key] = match;
		results.push(phrase.substring(trailingIndex, match.index));
		results.push(buckets[bucket as BucketName](key));
		trailingIndex = match.index + token.length;
	}
	results.push(phrase.substring(trailingIndex));

	return results.filter(Boolean);
}

/**
 * @deprecated Not in use
 */
export function createReplacementSpace(buckets: ReplacementBuckets) {
	return replace.bind(undefined, buckets);
}
