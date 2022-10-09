import { TimeLine } from './TimeLine.ts';

function noop() {
	/* no-op */
}

it('TimeLine.steps', () => {
	const time = new TimeLine();
	expect(time.now).toBe(0);
	time.steps(3);
	expect(time.now).toBe(3);
});

describe('TimeLine.setTimeout', () => {
	it('happy flow', () => {
		const time = new TimeLine();
		const fn = jest.fn();

		time.setTimeout(fn, 10);
		expect(fn).toBeCalledTimes(0);
		expect(time.getNextEventAbsoluteTime()).toBe(10);

		time.steps(10);
		expect(fn).toBeCalledTimes(1);
		expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
	});
	it('overlapping timeouts', () => {
		const time = new TimeLine();
		const fn1 = jest.fn();
		const fn2 = jest.fn();
		time.setTimeout(fn1, 3);
		time.setTimeout(fn2, 3);
		time.steps(3);
		expect(fn1).toBeCalledTimes(1);
		expect(fn2).toBeCalledTimes(1);
	});
	it('cancelling', () => {
		const fn = jest.fn();
		const time = new TimeLine();

		const destroy = time.setTimeout(fn, 10);
		expect(fn).toBeCalledTimes(0);
		expect(time.getNextEventAbsoluteTime()).toBe(10);

		time.steps(5);
		destroy();
		expect(time.getNextEventAbsoluteTime()).toBe(Infinity);

		time.steps(10);
		expect(fn).toBeCalledTimes(0);
	});
	it('cancelling + overlapping timeouts', () => {
		const time = new TimeLine();
		const fn1 = jest.fn();
		const fn2 = jest.fn();
		time.setTimeout(fn1, 3);
		const destroy = time.setTimeout(fn2, 3);
		destroy();
		time.steps(3);
		expect(fn1).toBeCalledTimes(1);
		expect(fn2).toBeCalledTimes(0);
	});
});
it('TimeLine.setTimeout', () => {
	const fn = jest.fn();
	const time = new TimeLine();

	time.setTimeout(fn, 10);
	expect(fn).toBeCalledTimes(0);
	expect(time.getNextEventAbsoluteTime()).toBe(10);

	time.steps(10);
	expect(fn).toBeCalledTimes(1);
	expect(time.getNextEventAbsoluteTime()).toBe(Infinity);
});

it('TimeLine.jump', () => {
	const time = new TimeLine();
	time.setTimeout(noop, 10);
	time.jump();
	expect(time.now).toBe(10);
});
