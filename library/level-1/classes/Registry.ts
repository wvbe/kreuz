export type SaveRegistryItemJson = string | null;

export class Registry<ItemGeneric> extends Map<string, ItemGeneric> {
	/**
	 * Returns `true` if the given item is already registered, `false` otherwise.
	 */
	public contains(item: ItemGeneric): boolean {
		for (const value of this.values()) {
			if (value === item) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Returns the key with which an item was registered, `null` otherwise.
	 */
	public key(item: ItemGeneric): string | null {
		for (const [key, entryItem] of this.entries()) {
			if (entryItem === item) {
				return key;
			}
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
		const node = this.get(key as string);
		if (!node) {
			throw new Error(`Could not load registry item with key "${key}"`);
		}
		return node;
	}

	/**
	 * Utility method to easily return an instance based on a reference in save JSON.
	 */
	public itemToSaveJson(item: ItemGeneric | null): string | null {
		return (item && this.key(item)) || null;
	}
}
