import type { TokenizedText } from '../../../ui/components/atoms/TokenizedText.tsx';

export function token(bucket: string | number | symbol, item: { id: string }): string {
	return `#{${String(bucket)}:${item.id}}`;
}

type BucketItems<BucketsGeneric extends Record<string, { id: string }>> =
	BucketsGeneric extends Record<string, infer I> ? I : never;

type BucketFunctions<BucketsGeneric extends Record<string, { id: string }>> = Record<
	string,
	(id: string) => BucketItems<BucketsGeneric> | null
>;

export type ReplacementSpaceResult<BucketsGeneric extends Record<string, { id: string }>> = Array<
	| string
	| [
			// A tuple of the matching item (or null), the key, and the entire token
			BucketItems<BucketsGeneric> | null,
			string,
			string,
	  ]
>;

/**
 * A registry that can be used find tokens of different kinds, to be replaced with different stuff.
 *
 * For example, {@link TokenizedText &lt;TokenizedText/&gt;} uses an instance of `ReplacementSpace` to render
 * clickable links instead of the mention of an entity.
 */
export class ReplacementSpace<BucketsGeneric extends Record<string, { id: string }>> {
	#buckets: BucketFunctions<BucketsGeneric>;

	public constructor(buckets: BucketFunctions<BucketsGeneric>) {
		this.#buckets = buckets;
	}

	public token(bucket: keyof BucketsGeneric, item: BucketItems<BucketsGeneric>): string {
		return token(bucket, item);
	}

	public replace(phrase: string): ReplacementSpaceResult<BucketsGeneric> {
		const regex = /#\{([^:]*):([^}]*)\}/g;
		const results: ReplacementSpaceResult<BucketsGeneric> = [];

		let trailingIndex = 0;
		let match;
		while ((match = regex.exec(phrase))) {
			const [token, bucket, key] = match;
			results.push(phrase.substring(trailingIndex, match.index));
			results.push([this.#buckets[bucket](key) || null, key, token]);
			trailingIndex = match.index + token.length;
		}
		results.push(phrase.substring(trailingIndex));

		return results.filter(Boolean);
	}
}
