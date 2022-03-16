import { EventedValue } from './EventedValue';

export class TimeLine extends EventedValue<number> {
	private timers = new Map<number, (() => void)[]>();
	public readonly multiplier: number;

	constructor(multiplier: number = 1, initial: number = 0) {
		super(initial);
		this.multiplier = multiplier;
	}

	get now() {
		return this.get();
	}

	private runAllImmediates() {
		const frame = this.now + 1;
		const timers = this.timers.get(frame);
		while (timers && timers.length > 0) {
			const runTimeout = timers.shift();
			runTimeout && runTimeout();
		}
		this.timers.delete(frame);
	}

	public step() {
		this.runAllImmediates();
		this.set(this.now + 1);
	}

	public steps(much: number) {
		let remaining = much;
		while (remaining-- > 0) {
			this.step();
		}
	}

	// @TOODO base this on a stateful property instead of reducing every time.
	//    Then, use in jump()
	public getNextEventAbsoluteTime() {
		return Array.from(this.timers.keys()).reduce((min, k) => Math.min(min, k), Infinity);
	}

	/**
	 * Returns a boolean indicating if (true) there are more events coming
	 * after this jump is done.
	 *
	 * @deprecated Untested.
	 */
	public jump() {
		const next = this.getNextEventAbsoluteTime();
		if (!next) {
			return;
		}
		// Quietly update to one frame _before_ the next event time
		this.set(next - 1, true);

		this.step();
	}

	public setTimeout(fn: () => void, time: number) {
		const frame = Math.ceil(this.now + time);
		if (!this.timers.has(frame)) {
			this.timers.set(frame, [fn]);
		} else {
			this.timers.get(frame)?.push(fn);
		}
		return () => {
			const timers = this.timers.get(frame);
			if (!timers) {
				return;
			}
			const filteredTimers = timers.filter(f => f !== fn);
			if (filteredTimers.length) {
				this.timers.set(frame, filteredTimers);
			} else {
				this.timers.delete(frame);
			}
		};
	}
}
