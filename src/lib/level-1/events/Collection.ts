import { CallbackFn, SortFn } from '../types';
import { Event } from './Event';

/**
 * A list of {@link ItemGeneric} things. Emits events when items are added or removed. Has most of the methods
 * that you would find on normal {@link Array}s.
 */
export class Collection<ItemGeneric> {
	protected readonly list: Array<ItemGeneric> = [];
	/**
	 * Event emitted when items are added to the collection. The event data contains an array of the added items.
	 */
	public readonly $add = new Event<[ItemGeneric[]]>('Collection $add');

	/**
	 * Event emitted when items are removed from the collection. The event data contains an array of the removed items.
	 */
	public readonly $remove = new Event<[ItemGeneric[]]>('Collection $remove');

	/**
	 * Event emitted when items are added and/or removed from the collection.
	 * The event data contains two arrays:
	 * 1. An array of items that were added
	 * 2. An array of items that were removed
	 */
	public readonly $change = new Event<[ItemGeneric[], ItemGeneric[]]>('Collection $change');

	/**
	 * Adds one or more items to the collection.
	 * This will trigger the $add and $change events with the added items.
	 *
	 * @param items - The items to add to the collection
	 * @returns A promise that resolves when the items have been added and events emitted
	 */
	public async add(...items: ItemGeneric[]) {
		await this.change(items, []);
	}

	/**
	 * Removes one or more items from the collection.
	 * This will trigger the $remove and $change events with the removed items.
	 *
	 * @param items - The items to remove from the collection
	 * @returns A promise that resolves when the items have been removed and events emitted
	 */
	public async remove(...items: ItemGeneric[]) {
		await this.change([], items);
	}

	/**
	 * Removes all items from the collection.
	 * This will trigger the $remove and $change events with all removed items.
	 *
	 * @returns A promise that resolves when all items have been removed and events emitted
	 */
	public async removeAll() {
		await this.remove(...this.list);
	}

	/**
	 * Add and/or remove items, emitting an update only once when all is said and done.
	 *
	 * - If items are added (duplicate or not) a list of these items is emitted as $add
	 * - If items that were removed from the collection, a list of them is emitted as $remove
	 * - If either occurred, both lists (added and removed) are emitted as the $change event
	 *
	 * @param addItems - Items to add to the collection
	 * @param removeItems - Items to remove from the collection
	 * @returns A promise that resolves when all changes are complete and events emitted
	 */
	public async change(addItems: ItemGeneric[], removeItems: ItemGeneric[]) {
		this.list.push(...addItems);
		const wasActuallyRemoved = removeItems.filter((item) => {
			const index = this.list.indexOf(item);
			if (index === -1) {
				return false;
			}
			this.list.splice(index, 1);
			return true;
		});
		if (addItems.length) {
			await this.$add.emit(addItems);
		}
		if (wasActuallyRemoved.length) {
			await this.$remove.emit(wasActuallyRemoved);
		}
		if (addItems.length || wasActuallyRemoved.length) {
			await this.$change.emit(addItems, wasActuallyRemoved);
		}
	}

	/**
	 * Gets an item at the specified index, with optional type casting.
	 *
	 * @param index - The index of the item to get
	 * @returns The item at the specified index
	 * @throws Error if no item exists at the specified index
	 */
	public get<S extends ItemGeneric = ItemGeneric>(index: number): S {
		const result = this.list[index];
		if (!result) {
			throw new Error(`Could not get item ${index} from ${this.constructor.name}`);
		}
		return result as S;
	}

	/**
	 * Finds the index of the first item that matches the filter function.
	 *
	 * @param filter - Function to test each item
	 * @returns The index of the first matching item, or -1 if no match found
	 */
	public findIndex(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => boolean,
	): number {
		return this.list.findIndex(filter);
	}

	/**
	 * Finds the first item that matches the filter function.
	 *
	 * @param filter - Function to test each item
	 * @returns The first matching item, or undefined if no match found
	 */
	public find(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => boolean,
	): ItemGeneric | undefined {
		return this.list.find(filter);
	}

	/**
	 * Returns a shallow copy of a portion of the collection.
	 *
	 * @param start - The beginning index of the slice
	 * @param end - The end index of the slice (exclusive)
	 * @returns A new array containing the extracted elements
	 */
	public slice(start?: number, end?: number): ItemGeneric[] {
		return this.list.slice(start, end);
	}

	/**
	 * Removes and returns the first item in the collection.
	 *
	 * @returns The first item in the collection, or undefined if collection is empty
	 */
	public shift(): ItemGeneric | undefined {
		return this.list.shift();
	}

	/**
	 * Gets the number of items in the collection.
	 */
	get length() {
		return this.list.length;
	}

	/**
	 * Sorts the items in the collection in place.
	 *
	 * @param sorter - Function used to determine the order of the elements
	 * @returns The collection instance for chaining
	 */
	public sort(sorter: SortFn<ItemGeneric>) {
		this.list.sort(sorter);
		return this;
	}

	/**
	 * Executes a provided function once for each item in the collection.
	 *
	 * @param callback - Function to execute for each element
	 */
	public forEach(callback: CallbackFn<[ItemGeneric, number, ItemGeneric[]]>): void {
		return this.list.forEach(callback);
	}

	/**
	 * Creates a new array with the results of calling a provided function on every element.
	 *
	 * @param mapper - Function that produces an element of the new array
	 * @returns A new array with each element being the result of the mapper function
	 */
	public map<X>(mapper: (item: ItemGeneric, index: number, all: ItemGeneric[]) => X): X[] {
		return this.list.map(mapper);
	}

	/**
	 * Creates a new array with all elements that pass the test implemented by the provided function.
	 *
	 * @param filter - Function to test each element
	 * @returns A new array with the elements that pass the test
	 */
	public filter<X extends ItemGeneric = ItemGeneric>(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => item is X,
	): X[];
	public filter<X extends ItemGeneric = ItemGeneric>(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => boolean,
	): X[];
	public filter<X extends ItemGeneric = ItemGeneric>(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => item is X,
	) {
		return this.list.filter(filter) as unknown[] as X[];
	}

	/**
	 * Determines whether the collection includes a certain item.
	 *
	 * @param item - The item to search for
	 * @returns True if the item is found, false otherwise
	 */
	public includes(item: ItemGeneric): boolean {
		return this.list.includes(item);
	}

	/**
	 * Reduces the collection to a single value (from left-to-right).
	 *
	 * @param callbackfn - Function to execute on each element
	 * @param initialValue - Value to use as the first argument to the first call of the callback
	 * @returns The value that results from running the reducer across all elements
	 */
	public reduce<ReduceGeneric>(
		callbackfn: (
			previousValue: ReduceGeneric,
			currentValue: ItemGeneric,
			currentIndex: number,
			array: ItemGeneric[],
		) => ReduceGeneric,
		initialValue: ReduceGeneric,
	): ReduceGeneric {
		return this.list.reduce<ReduceGeneric>(callbackfn, initialValue);
	}
}
