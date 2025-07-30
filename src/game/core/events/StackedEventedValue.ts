import { EventedValue } from './EventedValue';

/**
 * A value that emits an event when changed.
 */
export class StackedEventedValue<T> extends EventedValue<T> {
	protected stack: T[] = this.current ? [this.current] : [];

	// public get() {
	// 	return this.stack[this.stack.length - 1];
	// }
	// public async set(_: T) {
	// 	throw new Error('Use .push() instead of set()');
	// }

	public async push(value: T) {
		// this.stack.push(value);
		// await this.emit();
		this.set(value);
	}

	public async pop() {
		// this.stack.pop();
		// await this.emit();
		this.set(null as T);
	}
}
