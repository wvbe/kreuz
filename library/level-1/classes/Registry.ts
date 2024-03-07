export type SaveRegistryItemJson = string | null;

export class Registry<ItemGeneric> {
	#map = new Map<string, ItemGeneric>();

	/**
	 * Returns `true` if the given item is already registered, `false` otherwise.
	 */
	public contains(item: ItemGeneric): boolean {
		for (const value of this.#map.values()) {
			if (value === item) {
				return true;
			}
		}
		return false;
	}

	public item(key: string, throwOnMissingItem: true): ItemGeneric;
	public item(key: string, throwOnMissingItem?: false): ItemGeneric | null;
	public item(key: string, throwOnMissingItem = false): ItemGeneric | null {
		const item = this.#map.get(key);
		if (throwOnMissingItem && !item) {
			throw new Error(`Could not find key for missing item`);
		}
		return item || null;
	}

	public key(item: ItemGeneric, throwOnMissingItem: true): string;
	public key(item: ItemGeneric, throwOnMissingItem?: false): string;

	/**
	 * Returns the key with which an item was registered, `null` otherwise.
	 */
	public key(item: ItemGeneric, throwOnMissingItem = false): string | null {
		for (const [key, entryItem] of this.#map.entries()) {
			if (entryItem === item) {
				return key;
			}
		}
		if (throwOnMissingItem) {
			throw new Error(`Could not find key for missing item`);
		}
		return null;
	}

	/**
	 * Utility method to easily save a reference to the registered item in a save JSON.
	 */
	public itemFromSaveJson(key: string | null): null | ItemGeneric {
		if (key === null) {
			return null;
		}
		return this.item(key as string, true);
	}

	/**
	 * Utility method to easily return an instance based on a reference in save JSON.
	 */
	public itemToSaveJson(item: ItemGeneric | null): string | null {
		return item ? this.key(item, true) : null;
	}
	public set(key: string, item: ItemGeneric) {
		return this.#map.set(key, item);
	}
	public list(): ItemGeneric[] {
		return Array.from(this.#map.values());
	}
}
