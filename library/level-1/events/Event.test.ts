import { expect, mock } from '@test';
import { CallbackFn } from '../types.ts';
import { Event } from './Event.ts';

Deno.test('Event', async (test) => {
	await test.step('.on()', async () => {
		const event = new Event('test');
		const cb = mock.fn();
		event.on(cb);
		expect(cb).toHaveBeenCalledTimes(0);
		await event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
		await event.emit();
		expect(cb).toHaveBeenCalledTimes(2);

		expect(() => event.on(null as unknown as CallbackFn)).toThrow();
	});

	await test.step('.on() destroyer', () => {
		console.warn = mock.fn();
		const event = new Event('test');
		const destroyer = event.on(() => {});
		expect(event.$$$listeners).toBe(1);
		destroyer();
		expect(event.$$$listeners).toBe(0);
		expect(() => destroyer()).toThrow(/memory leak/i);
	});

	await test.step('.once()', async () => {
		const event = new Event('test');
		const cb = mock.fn();
		event.once(cb);
		expect(cb).toHaveBeenCalledTimes(0);
		await event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
		await event.emit();
		expect(cb).toHaveBeenCalledTimes(1);

		expect(() => event.once(null as unknown as CallbackFn)).toThrow();
	});

	await test.step('.once() destroyer', () => {
		console.warn = mock.fn();
		const event = new Event('test');
		const destroyer = event.once(() => {});
		expect(event.$$$listeners).toBe(1);
		destroyer();
		expect(event.$$$listeners).toBe(0);
		expect(() => destroyer()).toThrow(/memory leak/i);
	});

	await test.step('.clear()', () => {
		const event = new Event('test');
		event.on(() => {});
		event.once(() => {});
		expect(event.$$$listeners).toBe(2);
		event.clear();
		expect(event.$$$listeners).toBe(0);
	});

	await test.step('static .onAny', async () => {
		const event1 = new Event('test 1');
		const event2 = new Event('test 2');
		const cb = mock.fn();

		const destroyer = Event.onAny(cb, [event1, event2]);
		expect(event1.$$$listeners).toBe(1);
		expect(event2.$$$listeners).toBe(1);

		await event1.emit();
		expect(cb).toHaveBeenCalledTimes(1);

		await event2.emit();
		expect(cb).toHaveBeenCalledTimes(2);

		destroyer();
		expect(event1.$$$listeners).toBe(0);
		expect(event2.$$$listeners).toBe(0);
	});

	await test.step('static .onceFirst', async () => {
		const event1 = new Event('test 1');
		const event2 = new Event('test 2');
		const cb1 = mock.fn();
		const cb2 = mock.fn();

		const destroyer1 = Event.onceFirst(cb1, [event1, event2]);
		const destroyer2 = Event.onceFirst(cb2, [event1, event2]);

		destroyer1();

		expect(event1.$$$listeners).toBe(1);
		expect(event2.$$$listeners).toBe(1);

		await event1.emit();

		expect(cb1).toHaveBeenCalledTimes(0);
		expect(cb2).toHaveBeenCalledTimes(1);
		expect(event1.$$$listeners).toBe(0);
		expect(event2.$$$listeners).toBe(0);

		await event2.emit();
		expect(cb2).toHaveBeenCalledTimes(1);

		expect(() => destroyer2()).toThrow(/memory leak/i);
	});
});

Deno.test('Fixed issues', async (test) => {
	await test.step('.once() does not fire if other onces are registered', async () => {
		const event = new Event('test');
		const cb = mock.fn();
		event.once(() => {
			/* no-op */
		});
		event.once(cb);
		expect(cb).toHaveBeenCalledTimes(0);
		await event.emit();
		expect(cb).toHaveBeenCalledTimes(1);
	});
});
