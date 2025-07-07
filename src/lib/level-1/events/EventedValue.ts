import { type JsonValue } from 'https://deno.land/std@0.185.0/json/common';
import { Event } from './Event';

export type SaveEventedValueJson<As extends JsonValue = JsonValue> = {
	current: As;
	label: string;
};

/**
 * A value that emits an event when changed.
 */
export class EventedValue<T> extends Event<[T]> {
	protected current: T;

	/**
	 * Create a new value that emits an event when changed.
	 */
	public constructor(initial: T, label?: string) {
		super(label ?? 'EventedValue');
		this.current = initial;
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
}
