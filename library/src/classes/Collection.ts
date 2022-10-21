import { AnyJson, type SaveableObject } from '../types-savedgame.ts';
import { type CallbackFn, type SortFn } from '../types.ts';
import { Event } from './Event.ts';

export type SavedCollection<
	Item extends SaveableObject<SavedItem>,
	SavedItem extends AnyJson = Item extends SaveableObject<infer P> ? P : never,
> = {
	collection: Array<SavedItem>;
};

export class Collection<
	Item extends SaveableObject<SavedItem>,
	SavedItem extends AnyJson = Item extends SaveableObject<infer P> ? P : never,
> {
	#collection: Array<Item> = [];
	public readonly $add = new Event<[Item[]]>('Collection $add');
	public readonly $remove = new Event<[Item[]]>('Collection $remove');
	public readonly $change = new Event<[Item[], Item[]]>('Collection $change');

	public add(...items: Item[]) {
		this.change(items, []);
	}

	public remove(...items: Item[]) {
		this.change([], items);
	}

	/**
	 * Add and/or remove items, emitting an update only once when all is said and done.
	 *
	 * - If items are added (duplicate or not) a list of these items is emitted as $add
	 * - If items that were removed from the collection, a list of them is emitted as $remove
	 * - If either occurred, both lists (added and removed) are emitted as the $change event
	 */
	public change(addItems: Item[], removeItems: Item[]) {
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

	public findIndex(filter: (item: Item, index: number, array: Item[]) => boolean): number {
		return this.#collection.findIndex(filter);
	}
	public find(filter: (item: Item, index: number, array: Item[]) => boolean): Item | undefined {
		return this.#collection.find(filter);
	}
	public slice(start?: number, end?: number): Item[] {
		return this.#collection.slice(start, end);
	}

	get length() {
		return this.#collection.length;
	}
	public sort(sorter: SortFn<Item>) {
		this.#collection.sort(sorter);
		return this;
	}
	public forEach(callback: CallbackFn<[Item, number, Item[]]>): void {
		return this.#collection.forEach(callback);
	}
	public map<X>(mapper: (item: Item, index: number, all: Item[]) => X): X[] {
		return this.#collection.map(mapper);
	}
	public filter<X = Item>(filter: (item: Item, index: number, array: Item[]) => boolean) {
		return this.#collection.filter(filter) as unknown[] as X[];
	}
	/**
	 * @deprecated You probably meant to use add(), because it will trigger update events.
	 */
	public push(...items: Item[]): number {
		return this.#collection.push(...items);
	}

	public serializeToSaveJson(): SavedCollection<Item, SavedItem> {
		return {
			collection: this.#collection.map((item) => item.serializeToSaveJson()),
		};
	}
}
