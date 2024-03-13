import { CallbackFn, SortFn } from '../types.ts';
import { Event } from './Event.ts';

export class Collection<ItemGeneric> {
	protected readonly list: Array<ItemGeneric> = [];
	public readonly $add = new Event<[ItemGeneric[]]>('Collection $add');
	public readonly $remove = new Event<[ItemGeneric[]]>('Collection $remove');
	public readonly $change = new Event<[ItemGeneric[], ItemGeneric[]]>('Collection $change');

	public async add(...items: ItemGeneric[]) {
		await this.change(items, []);
	}

	public async remove(...items: ItemGeneric[]) {
		await this.change([], items);
	}

	public async removeAll() {
		await this.remove(...this.list);
	}

	/**
	 * Add and/or remove items, emitting an update only once when all is said and done.
	 *
	 * - If items are added (duplicate or not) a list of these items is emitted as $add
	 * - If items that were removed from the collection, a list of them is emitted as $remove
	 * - If either occurred, both lists (added and removed) are emitted as the $change event
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

	public get<S extends ItemGeneric = ItemGeneric>(index: number): S {
		const result = this.list[index];
		if (!result) {
			throw new Error(`Could not get item ${index} from ${this.constructor.name}`);
		}
		return result as S;
	}

	public findIndex(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => boolean,
	): number {
		return this.list.findIndex(filter);
	}

	public find(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => boolean,
	): ItemGeneric | undefined {
		return this.list.find(filter);
	}

	public slice(start?: number, end?: number): ItemGeneric[] {
		return this.list.slice(start, end);
	}

	public shift(): ItemGeneric | undefined {
		return this.list.shift();
	}

	get length() {
		return this.list.length;
	}

	public sort(sorter: SortFn<ItemGeneric>) {
		this.list.sort(sorter);
		return this;
	}

	public forEach(callback: CallbackFn<[ItemGeneric, number, ItemGeneric[]]>): void {
		return this.list.forEach(callback);
	}

	public map<X>(mapper: (item: ItemGeneric, index: number, all: ItemGeneric[]) => X): X[] {
		return this.list.map(mapper);
	}

	public filter<X = ItemGeneric>(
		filter: (item: ItemGeneric, index: number, array: ItemGeneric[]) => boolean,
	) {
		return this.list.filter(filter) as unknown[] as X[];
	}

	public includes(item: ItemGeneric): boolean {
		return this.list.includes(item);
	}
}
