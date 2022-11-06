import { expect, it, describe, mock, run } from 'https://deno.land/x/tincan@1.0.1/mod.ts';
import { Event } from './Event.ts';

describe('Event', () => {
	it('.on()', () => {
		const event = new Event('test');
		const cb = mock.fn();
		event.on(cb);
		expect(cb).toHaveBeenCalledTimes(0);
		event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
		event.emit();
		expect(cb).toHaveBeenCalledTimes(2);
	});

	it('.on() destroyer', () => {
		console.warn = mock.fn();
		const event = new Event('test');
		const destroyer = event.on(() => {});
		expect(event.$$$listeners).toBe(1);
		destroyer();
		expect(event.$$$listeners).toBe(0);
		expect(() => destroyer()).not.toThrow();
		expect(console.warn).toHaveBeenCalledWith(
			`Destroying an event listener that was already destroyed, you may have a memory leak.`,
		);
	});

	it('.once()', () => {
		const event = new Event('test');
		const cb = mock.fn();
		event.once(cb);
		expect(cb).toHaveBeenCalledTimes(0);
		event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
		event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
	});

	it('.once() destroyer', () => {
		console.warn = mock.fn();
		const event = new Event('test');
		const destroyer = event.once(() => {});
		expect(event.$$$listeners).toBe(1);
		destroyer();
		expect(event.$$$listeners).toBe(0);
		expect(() => destroyer()).not.toThrow();
		expect(console.warn).toHaveBeenCalledWith(
			`Destroying an event listener that was already destroyed, you may have a memory leak.`,
		);
	});

	it('.clear()', () => {
		const event = new Event('test');
		event.on(() => {});
		event.once(() => {});
		expect(event.$$$listeners).toBe(2);
		event.clear();
		expect(event.$$$listeners).toBe(0);
	});
});

describe('Fixed issues', () => {
	it('.once() does not fire if other onces are registered', () => {
		const event = new Event('test');
		const cb = mock.fn();
		event.once(() => {
			/* no-op */
		});
		event.once(cb);
		expect(cb).toHaveBeenCalledTimes(0);
		event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
	});
});

run();
