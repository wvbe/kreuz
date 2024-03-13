import { Collection, Event, EventedValue } from '@lib';
import { useCallback, useEffect, useState } from 'react';

function noTransformSingle<T, O = T>(value: T): O {
	// Shut the fuck up, TypeScript.
	return value as unknown as O;
}

export function useCollection<T>(collection: Collection<T>) {
	return useMemoFromEvent<[T[], T[]], T[]>(
		collection.$change,
		collection.slice(),
		useCallback(() => collection.slice(), [collection]),
	);
}

/**
 * Useful if you want to subscribe to the value controlled by EventedValue.
 *
 * Contrary to {@link useMemoFromEvent}, the returned value is not an array but only the value that is
 * actually being evented.
 */
export function useEventedValue<T = void, OutputGeneric = T>(
	eventedValue: EventedValue<T>,
	transform: (value: T) => OutputGeneric = noTransformSingle,
): OutputGeneric {
	const values = useMemoFromEvent<[T], [OutputGeneric]>(
		eventedValue,
		[transform(eventedValue.get())],
		useCallback((value: T): [OutputGeneric] => [transform(value)], [transform]),
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
export function useMemoFromEvent<
	EventArgsGeneric extends unknown[] = never[],
	OutputGeneric = EventArgsGeneric,
>(
	eventedValue: Event<EventArgsGeneric>,
	initial: OutputGeneric,
	transform: (...value: EventArgsGeneric) => OutputGeneric = noTransformMultiple,
): OutputGeneric {
	const [value, setValue] = useState<OutputGeneric>(initial);

	useEffect(() => {
		setValue(initial);
		return eventedValue.on(function useEventData_on(...value) {
			setValue(transform(...value));
		});
	}, [transform, eventedValue]);

	return value;
}
