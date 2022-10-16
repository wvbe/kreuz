import { useEffect, useState } from 'react';
import { EventedValue } from '@lib';

export function useEventedValue<T>(eventedValue: EventedValue<T>) {
	const [value, setValue] = useState<T>(eventedValue.get());

	useEffect(() => eventedValue.on(setValue), [eventedValue]);

	return value;
}
