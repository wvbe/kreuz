import { expect } from '@jest/globals';
import { Time } from './Time';

function noop() {
	/* no-op */
}
describe('Time', () => {
	it('.steps()', async () => {
		const time = new Time();
		expect(time.now).toBe(0);
		await time.steps(3);
		expect(time.now).toBe(3);
	});

	describe('.setTimeout()', () => {
		it('happy flow', async () => {
			const time = new Time();
			const fn = jest.fn();

			time.setTimeout(fn, 10);
			expect(fn).toHaveBeenCalledTimes(0);
			expect(time.getNextEventAbsoluteTime()).toBe(10);

			await time.steps(10);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
		});
		it('overlapping timeouts', async () => {
			const time = new Time();
			const fn1 = jest.fn();
			const fn2 = jest.fn();
			time.setTimeout(fn1, 3);
			time.setTimeout(fn2, 3);
			await time.steps(3);
			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(1);
		});

		it('cancelling', async () => {
			const fn = jest.fn();
			const time = new Time();

			const destroy = time.setTimeout(fn, 10);
			expect(fn).toHaveBeenCalledTimes(0);
			expect(time.getNextEventAbsoluteTime()).toBe(10);

			await time.steps(5);
			destroy();
			expect(time.getNextEventAbsoluteTime()).toBe(Infinity);

			await time.steps(10);
			expect(fn).toHaveBeenCalledTimes(0);
		});
		it('cancelling + overlapping timeouts', async () => {
			const time = new Time();
			const fn1 = jest.fn();
			const fn2 = jest.fn();
			time.setTimeout(fn1, 3);
			const destroy = time.setTimeout(fn2, 3);
			destroy();
			await time.steps(3);
			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(0);
		});
	});

	it('.jump()', async () => {
		const time = new Time();
		time.setTimeout(noop, 10);
		await time.jump();
		expect(time.now).toBe(10);
	});

	it('.getNextEventAbsoluteTime()', async () => {
		const time = new Time();
		expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
		time.setTimeout(noop, 10);
		expect(time.getNextEventAbsoluteTime()).toBe(10);
		await time.jump();
		time.setTimeout(noop, 10);
		expect(time.getNextEventAbsoluteTime()).toBe(20);
		await time.jump();
		expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
});
