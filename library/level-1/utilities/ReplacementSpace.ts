export function token(bucket: string | number | symbol, item: { id: string }): string {
	return `#{${String(bucket)}:${item.id}}`;
}

export class ReplacementSpace<
	BucketsGeneric extends Record<string, (key: string) => ItemGeneric>,
	ItemGeneric extends { id: string },
> {
	#buckets: BucketsGeneric;

	public constructor(buckets: BucketsGeneric) {
		this.#buckets = buckets;
	}

	public token(bucket: keyof BucketsGeneric, item: ItemGeneric): string {
		return token(bucket, item);
	}

	public replace(phrase: string): Array<string | ItemGeneric> {
		const regex = /#\{([^:]*):([^}]*)\}/g;
		const results: Array<string | ItemGeneric> = [];

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
