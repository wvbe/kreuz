import { Collection, Event, EventedValue } from '@lib';
import { useCallback, useEffect, useState } from 'react';

function noTransformSingle<T, O = T>(value: T): O {
	// Shut the fuck up, TypeScript.
	return value as unknown as O;
}

export function useCollection<T>(collection: Collection<T>) {
	return useEventData<[T[], T[]], T[]>(
		collection.$change,
		collection.slice(),
		useCallback(() => collection.slice(), [collection]),
	);
}

/**
 * Useful if you want to subscribe to the value controlled by EventedValue.
 *
 * Contrary to {@link useEventData}, the returned value is not an array but only the value that is
 * actually being evented.
 */
export function useEventedValue<T = void, O = T>(
	eventedValue: EventedValue<T>,
	transform: (value: T) => O = noTransformSingle,
): O {
	const values = useEventData<[T], [O]>(
		eventedValue,
		[transform(eventedValue.get())],
		useCallback((value: T): [O] => [transform(value)], [transform]),
	);
	return values[0];
}

function noTransformMultiple<T extends unknown[], O = T>(...value: T): O {
	// Shut the fuck up, TypeScript.
	return value as unknown as O;
}

/**
 * Useful if you want to capture the values emitted by an Event. Because events can emit multiple
 * values (arguments) at a time, the value returned by `useEvent` is an array of those values/arguments.
 *
 * @deprecated clumsy naming/solving the wrong problem.
 */
export function useEventData<T extends unknown[] = never[], O = T>(
	eventedValue: Event<T>,
	initial: O,
	transform: (...value: T) => O = noTransformMultiple,
): O {
	const [value, setValue] = useState<O>(initial);

	useEffect(() => {
		setValue(initial);
		return eventedValue.on(function useEventData_on(...value) {
			setValue(transform(...value));
		});
	}, [transform, eventedValue]);

	return value;
}
