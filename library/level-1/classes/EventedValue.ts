import { JsonValue } from 'https://deno.land/std@0.185.0/json/common.ts';
import { Event } from './Event.ts';
import Game from '../Game.ts';
import { SaveJsonContext } from '../types-savedgame.ts';

export type SaveEventedValueJson = {
	current: JsonValue;
	label: string;
};

type SerializationOptions<T> = {
	toJson: (context: SaveJsonContext, value: T) => JsonValue;
	fromJson: (context: SaveJsonContext, json: JsonValue) => T;
};

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
			fromJson(_context, json) {
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
	public set(value: T, skipUpdate?: boolean) {
		if (value === this.current) {
			return;
		}
		this.current = value;
		if (!skipUpdate) {
			this.emit();
		}
	}

	/**
	 * Emit that there was an update
	 */
	public emit() {
		super.emit(this.current);
	}

	public toSaveJson(context: SaveJsonContext): SaveEventedValueJson {
		return {
			current: this.#serializationOptions.toJson(context, this.current),
			label: this.label,
		};
	}

	public overwriteFromSaveJson(context: SaveJsonContext, save: SaveEventedValueJson) {
		this.set(this.#serializationOptions.fromJson(context, save.current), true);
	}
}
