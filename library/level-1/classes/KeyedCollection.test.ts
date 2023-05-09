import { expect, it, describe, run, mock } from 'tincan';
import { KeyedCollection } from './KeyedCollection.ts';

describe('KeyedCollection', () => {
	const collection = new KeyedCollection<'id', { id: number; name: string }>('id');

	collection.add({ id: 1, name: 'One' });

	it('.getByKey', () => {
		expect(collection.getByKey(0)).toBeNull();
		expect(collection.getByKey(1)).toEqual({ id: 1, name: 'One' });
	});
	it('Associate key/item', () => {
		expect(collection.getByKey(2)).toBeNull();
		const item = { id: 2, name: 'Two' };
		collection.add(item);
		expect(collection.getByKey(2)).toBe(item);
	});
	it('Unassociate key/item', () => {
		const item = collection.getByKey(2);
		expect(item).not.toBeNull();
		collection.remove(item!);
		expect(collection.getByKey(2)).toBeNull();
	});
});
run();
