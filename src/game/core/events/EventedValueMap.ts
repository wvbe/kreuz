import { EventedValue } from './EventedValue';

/**
 * A kind of {@link Map} where every value is {@link EventedValue}s.
 */
export class EventedValueMap<K, V> {
	#map = new Map<K, EventedValue<V>>();

	constructor(private readonly defaultValue: V) {}

	public get(key: K): EventedValue<V> {
		if (!this.#map.has(key)) {
			this.#map.set(key, new EventedValue<V>(this.defaultValue));
		}
		return this.#map.get(key)!;
	}

	public set(key: K, value: V) {
		this.get(key)?.set(value);

		return this;
	}

	public delete(key: K) {
		return this.#map.delete(key);
	}

	public clear() {
		this.#map.clear();
	}

	public forEach(
		callbackfn: (value: V, key: K, map: EventedValueMap<K, V>) => void,
		thisArg?: any,
	) {
		this.#map.forEach((value, key) => callbackfn(value.get(), key, this), thisArg);
	}

	public keys() {
		return this.#map.keys();
	}
}
