import { type JsonValue } from 'https://deno.land/std@0.185.0/json/common';
import { type SaveJsonContext } from '../types-savedgame';
import { Event } from './Event';

export type SaveEventedValueJson<As extends JsonValue = JsonValue> = {
	current: As;
	label: string;
};

type SerializationOptions<T> = {
	toJson: (context: SaveJsonContext, value: T) => JsonValue;
	fromJson: (context: SaveJsonContext, json: JsonValue) => Promise<T>;
};

/**
 * A value that emits an event when changed.
 */
export class EventedValue<T> extends Event<[T]> {
	protected current: T;

	#serializationOptions: SerializationOptions<T>;

	/**
	 * Create a new value that emits an event when changed.
	 */
	public constructor(initial: T, label: string, serializationOptions?: SerializationOptions<T>) {
		super(label);
		this.current = initial;
		this.#serializationOptions = serializationOptions || {
			toJson(_context, value) {
				return value as JsonValue;
			},
			async fromJson(_context, json) {
				return json as T;
			},
		};
	}

	/**
	 * Get the current value
	 */
	public get() {
		return this.current;
	}

	/**
	 * Set the current value, and probably emit an event too
	 */
	public async set(value: T, skipUpdate?: boolean) {
		if (value === this.current) {
			return;
		}
		this.current = value;
		if (!skipUpdate) {
			await this.emit();
		}
	}

	/**
	 * Emit that there was an update
	 */
	public async emit() {
		await super.emit(this.get());
	}

	public toSaveJson(context: SaveJsonContext): SaveEventedValueJson {
		return {
			current: this.#serializationOptions.toJson(context, this.current),
			label: this.label,
		};
	}

	public async overwriteFromSaveJson(
		context: SaveJsonContext,
		save: SaveEventedValueJson,
	): Promise<void> {
		await this.set(await this.#serializationOptions.fromJson(context, save.current), true);
	}
}
