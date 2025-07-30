import { expect } from '@jest/globals';
import { Collection } from './Collection';
import { CollectionBucket } from './CollectionBucket';

describe('CollectionBucket', () => {
	const collection = new Collection<number>();
	const bucketEven = new CollectionBucket(collection, (item): item is number => item % 2 === 0);
	const bucketOdd = new CollectionBucket(collection, (item): item is number => item % 2 === 1);

	it('things added', async () => {
		await collection.add(1, 2, 3, 4, 5, 6);
		expect(bucketEven.slice()).toEqual([2, 4, 6]);
		expect(bucketOdd.slice()).toEqual([1, 3, 5]);
	});

	it('things removed', async () => {
		await collection.remove(2, 3);
		expect(bucketEven.slice()).toEqual([4, 6]);
		expect(bucketOdd.slice()).toEqual([1, 5]);
	});

	it('initial data', async () => {
		const newBucket = new CollectionBucket(
			collection,
			(item): item is number => item % 3 === 0,
		);
		expect(newBucket.slice()).toEqual([6]);
	});
});
