import { Event } from './Event';

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
	 * Overwrite this property if you want to change the equality check.
	 */
	public equalityCheck: (a: T, b: T) => boolean = (a, b) => {
		return a === b;
	};

	/**
	 * Set the current value, and probably emit an event too
	 */
	public async set(value: T, skipUpdate?: boolean) {
		if (this.equalityCheck(this.current, value)) {
			// if (value === this.current) {
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
