import { EventedValue } from '../events/EventedValue';
import { type CallbackFn, type DestroyerFn } from '../types';

/**
 * Controls the flow of time in a game.
 */
export class Time extends EventedValue<number> {
	#timers = new Map<number, CallbackFn[]>();

	/**
	 * The slow-motion factor of time. A higher number means game time progresses slower.
	 */
	public speed = new EventedValue<number>(1, 'TimeLine speed');

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
	 *
	 * Note that this function sets .current and calls .emit(), same as the .set() method would do,
	 * albeit execute timers in between. This avoids the case where time is not updated yet and setTimeout
	 * of 1 frame thinks time progression is 0.
	 */
	public async step(): Promise<void> {
		const frame = this.now + 1;

		this.current = frame;
		const timers = this.#timers.get(frame);
		while (timers && timers.length > 0) {
			timers.shift()?.();
		}
		this.#timers.delete(frame);
		await this.emit();
	}

	/**
	 * Take many steps in quick succession.
	 */
	public async steps(much: number): Promise<void> {
		let remaining = much;
		while (remaining-- > 0) {
			await this.step();
		}
	}

	/**
	 * Performs the amount of steps necessary for the given delta time, and per the time dilation.
	 */
	public async stepsForDelta(delta: number): Promise<void> {
		return this.steps(delta * this.speed.get());
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
	public async jump(next = this.getNextEventAbsoluteTime()): Promise<void> {
		if (!next || next === Infinity) {
			throw new Error(`There is no next event to jump to`);
		}
		await this.set(next - 1, true);
		await this.step();
	}

	public async skip(to: number) {
		let next: number = this.getNextEventAbsoluteTime();
		while (next < to) {
			await this.jump(next);
			next = this.getNextEventAbsoluteTime();
		}
		if (this.now < to) {
			await this.jump(to);
		}
	}

	/**
	 * Schedule a callback for a relative amount of time in the future.
	 *
	 * Returns the destroyer function with which the timeout can be cancelled. Calling the destroyer
	 * will return to you the amount of time that was left on the timeout.
	 */
	public setTimeout(callback: CallbackFn, delay: number): DestroyerFn<number> {
		if (delay === Infinity || delay <= 0) {
			throw new Error(
				`Timeout delay must be between 0 and Infinity, but was set to ${delay}.`,
			);
		}
		const now = this.now;
		const frame = Math.ceil(now + delay);
		if (!this.#timers.has(frame)) {
			this.#timers.set(frame, [callback]);
		} else {
			this.#timers.get(frame)?.push(callback);
		}
		return () => {
			const timeLeft = frame - now;
			const timers = this.#timers.get(frame);
			if (!timers) {
				return timeLeft;
			}
			const filteredTimers = timers.filter((f) => f !== callback);
			if (filteredTimers.length) {
				this.#timers.set(frame, filteredTimers);
			} else {
				this.#timers.delete(frame);
			}
			return timeLeft;
		};
	}

	/**
	 * Wait for a promise to resolve after the indicated amount of "time"
	 */
	public async wait(time: number): Promise<void> {
		await new Promise<void>((resolve) => {
			this.setTimeout(() => {
				resolve();
			}, time);
		});
	}
}
