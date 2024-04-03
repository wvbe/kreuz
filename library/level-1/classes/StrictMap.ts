export type SaveRegistryItemJson = string | null;

/**
 * A class extension of {@link Map} that throws when a key does not exist (eg. {@link StrictMap.get}
 * and {@link StrictMap.key}).
 *
 * Also has a few utility methods, such as {@link StrictMap.contains}, {@link StrictMap.key}, and
 * {@link StrictMap.toArray}.
 */
export class StrictMap<ItemGeneric> extends Map<string, ItemGeneric> {
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

	public get(key: string): ItemGeneric {
		const item = super.get(key);
		if (!item) {
			console.log(key);
			throw new Error(`Could not find item for key "${key}"`);
		}
		return item;
	}

	public key(item: ItemGeneric, throwOnMissingItem: true): string;

	public key(item: ItemGeneric, throwOnMissingItem?: false): string;

	/**
	 * Returns the key with which an item was registered, `null` otherwise.
	 */
	public key(item: ItemGeneric, throwOnMissingItem = false): string | null {
		for (const [key, entryItem] of this.entries()) {
			if (entryItem === item) {
				return key;
			}
		}
		if (throwOnMissingItem) {
			throw new Error(`Could not find key for missing item`);
		}
		return null;
	}

	public toArray(): ItemGeneric[] {
		return Array.from(this.values());
	}
}
