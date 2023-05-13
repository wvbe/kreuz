export function token(bucket: string | number | symbol, item: { id: string }): string {
	return `#{${String(bucket)}:${item.id}}`;
}

type BucketItems<BucketsGeneric extends Record<string, { id: string }>> =
	BucketsGeneric extends Record<string, infer I> ? I : never;

type BucketFunctions<BucketsGeneric extends Record<string, { id: string }>> = Record<
	string,
	(id: string) => BucketItems<BucketsGeneric> | null
>;

export class ReplacementSpace<BucketsGeneric extends Record<string, { id: string }>> {
	#buckets: BucketFunctions<BucketsGeneric>;

	public constructor(buckets: BucketFunctions<BucketsGeneric>) {
		this.#buckets = buckets;
	}

	public token(bucket: keyof BucketsGeneric, item: BucketItems<BucketsGeneric>): string {
		return token(bucket, item);
	}

	public replace(phrase: string): Array<string | BucketItems<BucketsGeneric> | null> {
		const regex = /#\{([^:]*):([^}]*)\}/g;
		const results: Array<string | BucketItems<BucketsGeneric> | null> = [];

		console.log('Replace', phrase);
		let trailingIndex = 0;
		let match;
		while ((match = regex.exec(phrase))) {
			const [token, bucket, key] = match;
			results.push(phrase.substring(trailingIndex, match.index));
			results.push(this.#buckets[bucket](key));
			trailingIndex = match.index + token.length;
		}
		results.push(phrase.substring(trailingIndex));

		return results.filter(Boolean);
	}
}
