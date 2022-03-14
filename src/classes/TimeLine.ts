import { EventedValue } from './EventedValue';

export class TimeLine extends EventedValue<number> {
	public timers = new Map<number, (() => void)[]>();

	constructor(initial: number = 0) {
		super(initial);
	}

	get now() {
		return this.get();
	}

	private runAllImmediates() {
		const timers = this.timers.get(this.now);
		while (timers && timers.length > 0) {
			const runTimeout = timers.shift();
			runTimeout && runTimeout();
		}
		this.timers.delete(this.now);
	}

	public step() {
		this.runAllImmediates();
		this.set(this.now + 1);
	}

	public steps(much: number) {
		while (much-- > 0) {
			this.step();
		}
	}

	// @TOODO base this on a stateful property instead of reducing every time.
	//    Then, use in jump()
	public getNextEventTime() {
		return Array.from(this.timers.keys()).reduce((min, k) => Math.min(min, k), Infinity);
	}

	/**
	 * Returns a boolean indicating if (true) there are more events coming
	 * after this jump is done.
	 *
	 * @deprecated Untested.
	 */
	public jump() {
		const next = this.getNextEventTime();
		if (!next) {
			return false;
		}
		this.set(next, true);
		this.step();
		return true;
	}

	/**
	 * @deprecated Untested.
	 */
	public jumps(much: number) {
		while (--much >= 0) {
			if (!this.jump()) {
				return;
			}
		}
	}

	setTimeout(fn: () => void, time: number) {
		const mark = this.get() + time;
		if (!this.timers.has(mark)) {
			this.timers.set(mark, [fn]);
		} else {
			this.timers.get(mark)?.push(fn);
		}
		return () => this.timers.set(mark, this.timers.get(mark)?.filter(f => f !== fn) || []);
	}
}
