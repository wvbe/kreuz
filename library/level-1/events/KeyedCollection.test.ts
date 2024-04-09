import { expect } from '@test';
import { KeyedCollection } from './KeyedCollection.ts';

Deno.test('KeyedCollection', async (test) => {
	const collection = new KeyedCollection<'id', { id: number; name: string }>('id');
	await collection.add({ id: 1, name: 'One' });

	await test.step('.getByKey', () => {
		expect(collection.getByKey(0)).toBeNull();
		expect(collection.getByKey(1)).toEqual({ id: 1, name: 'One' });
	});
	await test.step('Associate key/item', async () => {
		expect(collection.getByKey(2)).toBeNull();
		const item = { id: 2, name: 'Two' };
		await collection.add(item);
		expect(collection.getByKey(2)).toBe(item);
	});
	await test.step('Unassociate key/item', async () => {
		const item = collection.getByKey(2);
		expect(item).not.toBeNull();
		await collection.remove(item!);
		expect(collection.getByKey(2)).toBeNull();
	});
});
