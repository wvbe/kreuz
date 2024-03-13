import { expect, it, describe, run, beforeAll } from '@test';
import { KeyedCollection } from './KeyedCollection.ts';

describe('KeyedCollection', () => {
	const collection = new KeyedCollection<'id', { id: number; name: string }>('id');
	beforeAll(async () => {
		await collection.add({ id: 1, name: 'One' });
	});
	it('.getByKey', () => {
		expect(collection.getByKey(0)).toBeNull();
		expect(collection.getByKey(1)).toEqual({ id: 1, name: 'One' });
	});
	it('Associate key/item', async () => {
		expect(collection.getByKey(2)).toBeNull();
		const item = { id: 2, name: 'Two' };
		await collection.add(item);
		expect(collection.getByKey(2)).toBe(item);
	});
	it('Unassociate key/item', async () => {
		const item = collection.getByKey(2);
		expect(item).not.toBeNull();
		await collection.remove(item!);
		expect(collection.getByKey(2)).toBeNull();
	});
});
run();
