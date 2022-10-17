import { CallbackFn, SortFn } from '../types.ts';
import { Event } from './Event.ts';

export class Collection<T> {
	#collection: Array<T> = [];
	public readonly $add = new Event<[T[]]>('Collection $add');
	public readonly $remove = new Event<[T[]]>('Collection $remove');
	public readonly $change = new Event<[T[], T[]]>('Collection $change');

	public add(...items: T[]) {
		this.change(items, []);
	}

	public remove(...items: T[]) {
		this.change([], items);
	}

	/**
	 * Add and/or remove items, emitting an update only once when all is said and done.
	 *
	 * - If items are added (duplicate or not) a list of these items is emitted as $add
	 * - If items that were removed from the collection, a list of them is emitted as $remove
	 * - If either occurred, both lists (added and removed) are emitted as the $change event
	 */
	public change(addItems: T[], removeItems: T[]) {
		this.#collection.push(...addItems);
		const wasActuallyRemoved = removeItems.filter((item) => {
			const index = this.#collection.indexOf(item);
			if (index === -1) {
				return false;
			}
			this.#collection.splice(index, 1);
			return true;
		});
		if (addItems.length) {
			this.$add.emit(addItems);
		}
		if (wasActuallyRemoved.length) {
			this.$remove.emit(wasActuallyRemoved);
		}
		if (addItems.length || wasActuallyRemoved.length) {
			this.$change.emit(addItems, wasActuallyRemoved);
		}
	}

	public get(index: number) {
		return this.#collection[index];
	}

	public findIndex(filter: (item: T, index: number, array: T[]) => boolean): number {
		return this.#collection.findIndex(filter);
	}
	public find(filter: (item: T, index: number, array: T[]) => boolean): T | undefined {
		return this.#collection.find(filter);
	}
	public slice(start?: number, end?: number): T[] {
		return this.#collection.slice(start, end);
	}

	get length() {
		return this.#collection.length;
	}
	public sort(sorter: SortFn<T>) {
		this.#collection.sort(sorter);
		return this;
	}
	public forEach(callback: CallbackFn<[T, number, T[]]>): void {
		return this.#collection.forEach(callback);
	}
	public map<X>(mapper: (item: T, index: number, all: T[]) => X): X[] {
		return this.#collection.map(mapper);
	}
	public filter<X = T>(filter: (item: T, index: number, array: T[]) => boolean) {
		return this.#collection.filter(filter) as unknown[] as X[];
	}
	/**
	 * @deprecated You probably meant to use add(), because it will trigger update events.
	 */
	public push(...items: T[]): number {
		return this.#collection.push(...items);
	}
}
