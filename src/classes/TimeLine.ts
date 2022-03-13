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
		while (--much > 0) {
			this.step();
		}
	}
	/**
	 * Returns a boolean indicating if (true) there are more events coming
	 * after this jump is done.
	 */
	public jump() {
		const keys = Array.from(this.timers.keys());
		if (!keys.length) {
			return false;
		}
		this.set(
			keys.reduce((min, k) => Math.min(min, k), Infinity),
			true
		);
		this.step();
		return this.timers.size > 1;
	}

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
