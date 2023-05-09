import { describe, expect, it, run } from 'tincan';
import { ReplacementSpace } from './ReplacementSpace.ts';

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
	const space = new ReplacementSpace({
		foo: (id) => objects.foo[id],
		bar: (id) => objects.bar[id],
	});
	const str = `${space.token('bar', objects.bar.a)} foo ${space.token(
		'foo',
		objects.foo.a,
	)} bar ${space.token('foo', objects.foo.b)} baz`;
	expect(str).toBe('#{bar:a} foo #{foo:a} bar #{foo:b} baz');

	const replaced = space.replace(str);
	expect(replaced).toEqual([objects.bar.a, ' foo ', objects.foo.a, ' bar ', objects.foo.b, ' baz']);
});

run();
