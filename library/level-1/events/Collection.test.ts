import { expect, it, describe, run, mock } from '@test';
import { Collection } from './Collection.ts';

function createMocks<T>() {
	const collection = new Collection<T>();
	const onAdd = mock.fn();
	const onRemove = mock.fn();
	const onChange = mock.fn();
	collection.$add.on(onAdd);
	collection.$remove.on(onRemove);
	collection.$change.on(onChange);
	return {
		collection,
		onAdd,
		onRemove,
		onChange,
	};
}

const obj1 = { id: 1 };
const obj2 = { id: 2 };
const obj3 = { id: 3 };

describe('Collection', () => {
	it('.add()', async () => {
		const { collection, onAdd, onRemove, onChange } = createMocks<{ id: number }>();
		expect(onAdd).toHaveBeenCalledTimes(0);
		expect(onRemove).toHaveBeenCalledTimes(0);
		expect(onChange).toHaveBeenCalledTimes(0);

		await collection.add(obj1);
		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(0);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(collection.length).toBe(1);

		await collection.add(obj2, obj3);
		expect(onAdd).toHaveBeenCalledTimes(2);
		expect(onRemove).toHaveBeenCalledTimes(0);
		expect(onChange).toHaveBeenCalledTimes(2);
		expect(collection.length).toBe(3);
	});

	it('.get()', async () => {
		const collection = new Collection<{ id: number }>();
		await collection.add(obj1);
		expect(collection.get(0)).toBe(obj1);
		expect(() => collection.get(1)).toThrow();
	});

	it('.remove()', async () => {
		const { collection, onAdd, onRemove, onChange } = createMocks<{ id: number }>();
		await collection.add(obj1);
		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(0);
		expect(onChange).toHaveBeenCalledTimes(1);

		await collection.remove(obj1);
		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(2);
		expect(collection.length).toBe(0);

		await collection.remove(obj1);
		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(2);
		expect(collection.length).toBe(0);
	});

	it('.change()', async () => {
		const { collection, onAdd, onRemove, onChange } = createMocks<{ id: number }>();
		expect(onAdd).toHaveBeenCalledTimes(0);
		expect(onRemove).toHaveBeenCalledTimes(0);
		expect(onChange).toHaveBeenCalledTimes(0);

		await collection.change([obj1, obj2], []);
		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(0);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect(collection.length).toBe(2);

		await collection.change([], [obj1]);
		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onRemove).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(2);
		expect(collection.length).toBe(1);

		await collection.change([obj3], [obj2]);
		expect(onAdd).toHaveBeenCalledTimes(2);
		expect(onRemove).toHaveBeenCalledTimes(2);
		expect(onChange).toHaveBeenCalledTimes(3);
		expect(collection.length).toBe(1);
	});
});
run();
