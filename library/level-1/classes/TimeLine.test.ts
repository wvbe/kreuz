import { expect, it, describe, run, mock } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { TimeLine } from './TimeLine.ts';

function noop() {
	/* no-op */
}
describe('TimeLine', () => {
	it('.steps()', () => {
		const time = new TimeLine();
		expect(time.now).toBe(0);
		time.steps(3);
		expect(time.now).toBe(3);
	});

	describe('.setTimeout()', () => {
		it('happy flow', () => {
			const time = new TimeLine();
			const fn = mock.fn();

			time.setTimeout(fn, 10);
			expect(fn).toHaveBeenCalledTimes(0);
			expect(time.getNextEventAbsoluteTime()).toBe(10);

			time.steps(10);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
		});
		it('overlapping timeouts', () => {
			const time = new TimeLine();
			const fn1 = mock.fn();
			const fn2 = mock.fn();
			time.setTimeout(fn1, 3);
			time.setTimeout(fn2, 3);
			time.steps(3);
			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(1);
		});
		it('cancelling', () => {
			const fn = mock.fn();
			const time = new TimeLine();

			const destroy = time.setTimeout(fn, 10);
			expect(fn).toHaveBeenCalledTimes(0);
			expect(time.getNextEventAbsoluteTime()).toBe(10);

			time.steps(5);
			destroy();
			expect(time.getNextEventAbsoluteTime()).toBe(Infinity);

			time.steps(10);
			expect(fn).toHaveBeenCalledTimes(0);
		});
		it('cancelling + overlapping timeouts', () => {
			const time = new TimeLine();
			const fn1 = mock.fn();
			const fn2 = mock.fn();
			time.setTimeout(fn1, 3);
			const destroy = time.setTimeout(fn2, 3);
			destroy();
			time.steps(3);
			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(0);
		});
	});

	it('.jump()', () => {
		const time = new TimeLine();
		time.setTimeout(noop, 10);
		time.jump();
		expect(time.now).toBe(10);
	});

	it('.getNextEventAbsoluteTime()', () => {
		const time = new TimeLine();
		expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
		time.setTimeout(noop, 10);
		expect(time.getNextEventAbsoluteTime()).toBe(10);
		time.jump();
		time.setTimeout(noop, 10);
		expect(time.getNextEventAbsoluteTime()).toBe(20);
		time.jump();
		expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});
run();
