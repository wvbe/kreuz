import { describe, expect, it, run } from 'tincan';
import { token, replace, type ReplacementBuckets } from './replacementToken.ts';

it('replace', () => {
	const objects: Record<string, Record<string, { id: string; toString: () => string }>> = {
		foo: {
			a: { id: 'a', toString: () => 'A' },
			b: { id: 'b', toString: () => 'B' },
		},
		bar: {
			a: { id: 'a', toString: () => 'A' },
			b: { id: 'b', toString: () => 'B' },
		},
	};
	const buckets: ReplacementBuckets = {
		foo: (id) => objects.foo[id],
		bar: (id) => objects.bar[id],
	};
	const str = `${token('bar', objects.bar.a)} foo ${token('foo', objects.foo.a)} bar ${token(
		'foo',
		objects.foo.b,
	)} baz`;
	expect(str).toBe('#{bar:a} foo #{foo:a} bar #{foo:b} baz');

	const replaced = replace(buckets, str);
	expect(replaced).toEqual([objects.bar.a, ' foo ', objects.foo.a, ' bar ', objects.foo.b, ' baz']);
});

run();
