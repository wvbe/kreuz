import { Event } from './Event';

export class EventedValue<T> {
	private current: T;

	/**
	 * The event that this value changes.
	 */
	public readonly $change = new Event<[T]>();

	/**
	 * Create a new value that emits an event when changed.
	 */
	public constructor(initialValue: T) {
		this.current = initialValue;
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
		this.current = value;
		if (!skipUpdate) {
			this.emit();
		}
	}

	/**
	 * Emit that there was an update
	 */
	public emit() {
		this.$change.emit(this.current);
	}
}
