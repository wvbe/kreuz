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

// xit('#onAny', () => {});

// xit('#onceFirst', () => {});

run();
