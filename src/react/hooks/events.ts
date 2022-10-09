import { DependencyList, useCallback, useEffect, useState } from 'react';
import { Event } from '../../classes/Event.ts';
import { EventedValue } from '../../classes/EventedValue.ts';

export function useEventCallback<Args extends unknown[]>(
	event: Event<Args>,
	callback: (...args: Args) => void,
	dependencies: DependencyList,
): void {
	useEffect(
		// Register callback with the event, and return the destroy function so components stop
		// listening for the event when they're unmounted.
		() => event.on(callback),
		[
			event,
			callback,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			...dependencies,
		],
	);
}

export function useEventReducer<Data>(
	event: Event<any>,
	reducer: () => Data,
	dependencies: DependencyList,
): Data {
	const [state, setState] = useState(reducer());
	const callback = useCallback(() => {
		setState(reducer());
	}, [
		setState,
		reducer,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		...dependencies,
	]);
	useEffect(() => {
		callback();
	}, [
		event,
		callback,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		...dependencies,
	]);
	useEventCallback(event, callback, []);
	return state;
}

export function useEventedValue<Data>(event: EventedValue<Data>): Data {
	return useEventReducer(event, event.get.bind(event), []);
}
