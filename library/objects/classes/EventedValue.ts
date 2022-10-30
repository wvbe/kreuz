import { Event } from './Event.ts';

export class EventedValue<T> extends Event<[T]> {
	protected current: T;

	/**
	 * Create a new value that emits an event when changed.
	 */
	public constructor(initial: T, label: string, debug?: boolean) {
		super(label, debug);
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
		super.emit(this.current);
	}
}
