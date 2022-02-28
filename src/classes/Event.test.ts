import { Event } from './Event';

it('.on()', () => {
	const event = new Event();
	const cb = jest.fn();
	event.on(cb);
	expect(cb).toHaveBeenCalledTimes(0);
	event.emit();
	expect(cb).toHaveBeenCalledTimes(1);
	event.emit();
	expect(cb).toHaveBeenCalledTimes(2);
});

it('.once()', () => {
	const event = new Event();
	const cb = jest.fn();
	event.once(cb);
	expect(cb).toHaveBeenCalledTimes(0);
	event.emit();
	expect(cb).toHaveBeenCalledTimes(1);
	event.emit();
	expect(cb).toHaveBeenCalledTimes(1);
});

xit('#onAny', () => {});

xit('#onceFirst', () => {});
