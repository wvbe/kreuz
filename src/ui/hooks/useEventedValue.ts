import { useCallback, useEffect, useMemo, useState } from 'react';
import { Collection } from '../../game/core/events/Collection';
import { CollectionBucket } from '../../game/core/events/CollectionBucket';
import { EventedValue } from '../../game/core/events/EventedValue';
import { EventEmitterI } from '../../game/core/events/types';

function noTransformSingle<T, O = T>(value: T): O {
	// Shut the fuck up, TypeScript.
	return value as unknown as O;
}

/**
 * A hook that returns a reactive array from the provided collection.
 *
 * If the second argument is provided, the original collection is split to a {@link CollectionBucket}
 * with that filter for efficient updates.
 */
export function useCollection<T>(collection: Collection<T>, filter?: (item: T) => item is T) {
	const coll = useMemo(
		() => (filter ? new CollectionBucket(collection, filter) : collection),
		[collection, filter],
	);
	return useMemoFromEvent<[T[], T[]], T[]>(
		coll.$change,
		coll.slice(),
		useCallback(() => coll.slice(), [coll]),
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
	const t = useCallback((value: T): OutputGeneric => transform(value), [transform]);
	const values = useMemoFromEvent<[T], OutputGeneric>(
		eventedValue,
		transform(eventedValue.get()),
		t,
	);
	return values;
}

function noTransformMultiple<T extends unknown[], O = T>(...value: T): O {
	// Shut the fuck up, TypeScript.
	return value as unknown as O;
}

/**
 * Useful if you want to capture the values emitted by an Event. Because events can emit multiple
 * values (arguments) at a time, the value returned by `useEvent` is an array of those values/arguments.
 */
export function useMemoFromEvent<
	EventArgsGeneric extends unknown[] = any[],
	OutputGeneric = EventArgsGeneric,
>(
	eventedValue: EventEmitterI<EventArgsGeneric>,
	initial: OutputGeneric,
	transform: (...value: EventArgsGeneric) => OutputGeneric = noTransformMultiple,
): OutputGeneric {
	const [value, setValue] = useState<OutputGeneric>(initial);

	useEffect(() => {
		setValue(initial);
		return eventedValue?.on(function useEventData_on(...value) {
			setValue(transform(...value));
		});
	}, [transform, eventedValue]);

	return value;
}
