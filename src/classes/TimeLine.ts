import { SaveTimeJson } from '../types-savedgame.ts';
import { EventedValue } from './EventedValue.ts';

export class TimeLine extends EventedValue<number> {
	#timers = new Map<number, (() => void)[]>();

	public constructor(initial: number = 0) {
		super(initial, 'TimeLine');
	}

	/**
	 * The current absolute time passed.
	 */
	get now(): number {
		return this.get();
	}

	/**
	 * Take one step. Runs all callbacks registers for that specific time, and then removes them.
	 */
	public step(): void {
		const frame = this.now + 1;
		const timers = this.#timers.get(frame);
		while (timers && timers.length > 0) {
			timers.shift()?.();
		}
		this.#timers.delete(frame);
		this.set(frame);
	}

	/**
	 * Take many steps in quick succession.
	 */
	public steps(much: number): void {
		let remaining = much;
		while (remaining-- > 0) {
			this.step();
		}
	}

	/**
	 * Wether or not there are events planned for the future.
	 */
	public hasNextEvent(): boolean {
		return this.#timers.size > 0;
	}

	/**
	 * Get the time at which the next scheduled event occurs
	 *
	 * @todo Make this cheap.
	 */
	public getNextEventAbsoluteTime(): number {
		return Array.from(this.#timers.keys()).reduce((min, k) => Math.min(min, k), Infinity);
	}

	/**
	 * Jump to a future time, skipping all steps in between, and _then_ step.
	 *
	 * By default it would skip to the next point in time with a registered timer, and trigger it.
	 */
	public jump(next = this.getNextEventAbsoluteTime()): void {
		if (!next) {
			return;
		}
		this.set(next - 1, true);
		this.step();
	}

	/**
	 * Schedule a callback for a relative amount of time in the future.
	 *
	 * Returns the function with which the timeout can be cancelled.
	 */
	public setTimeout(fn: () => void, time: number): () => void {
		const frame = Math.ceil(this.now + time);
		if (!this.#timers.has(frame)) {
			this.#timers.set(frame, [fn]);
		} else {
			this.#timers.get(frame)?.push(fn);
		}
		return () => {
			// Cancel this timeout
			const timers = this.#timers.get(frame);
			if (!timers) {
				return;
			}
			const filteredTimers = timers.filter((f) => f !== fn);
			if (filteredTimers.length) {
				this.#timers.set(frame, filteredTimers);
			} else {
				this.#timers.delete(frame);
			}
		};
	}

	/**
	 * Serialize for a save game JSON
	 */
	public serializeToSaveJson(): SaveTimeJson {
		return {};
	}
}
