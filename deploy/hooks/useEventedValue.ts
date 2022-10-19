import { useEffect, useState } from 'react';
import { EventedValue } from '@lib';

export function useEventedValue<T>(eventedValue: EventedValue<T>): T;
export function useEventedValue<T>(eventedValue: null | undefined): undefined;
export function useEventedValue<T>(
	eventedValue: EventedValue<T> | null | undefined,
): T | undefined {
	const [value, setValue] = useState<T | undefined>(eventedValue?.get());

	useEffect(() => eventedValue?.on(setValue), [eventedValue]);

	return value;
}
