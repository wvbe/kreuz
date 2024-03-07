import { Collection } from './Collection.ts';

export class KeyedCollection<
	KeyGeneric extends string,
	ItemGeneric extends Record<KeyGeneric, unknown>,
> extends Collection<ItemGeneric> {
	/**
	 * The property at which items are keyed, for example "id"
	 */
	#itemKey: KeyGeneric;
	#keyMap = new Map<unknown, ItemGeneric | null>();

	constructor(itemKey: KeyGeneric) {
		super();
		this.#itemKey = itemKey;
	}

	#associateKey(item: ItemGeneric): void {
		const key = item[this.#itemKey];
		if (this.#keyMap.has(key)) {
			throw new Error(`Cannot associate a key "${key}" that is already occupied`);
		}
		this.#keyMap.set(key, item);
	}

	#unassociateKey(item: ItemGeneric): void {
		const key = item[this.#itemKey];
		if (!this.#keyMap.has(key)) {
			throw new Error(`Cannot unassociate a key "${key}" that is not occupied`);
		}
		this.#keyMap.delete(key);
	}

	/**
	 * Add and/or remove items, emitting an update only once when all is said and done.
	 *
	 * - If items are added (duplicate or not) a list of these items is emitted as $add
	 * - If items that were removed from the collection, a list of them is emitted as $remove
	 * - If either occurred, both lists (added and removed) are emitted as the $change event
	 */
	public async change(addItems: ItemGeneric[], removeItems: ItemGeneric[]) {
		// Method is a fork of Collection#change, but with added #associateKey and #unassociateKEy calls
		this.list.push(...addItems);
		addItems.forEach((item) => {
			this.#associateKey(item);
		});
		const wasActuallyRemoved = removeItems.filter((item) => {
			const index = this.list.indexOf(item);
			if (index === -1) {
				return false;
			}
			this.list.splice(index, 1);
			this.#unassociateKey(item);
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
	public getByKey(key: ItemGeneric[KeyGeneric]): ItemGeneric | null {
		return this.#keyMap.get(key) || null;
	}
}
