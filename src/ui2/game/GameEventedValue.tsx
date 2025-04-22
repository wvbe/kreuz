import React, { FC } from 'react';
import { EventedValue } from '../../lib/level-1/events/EventedValue';
import { useEventedValue } from '../../ui/hooks/useEventedValue';

type Type = string | number | React.ReactNode | null | undefined | any;

/**
 * A component that displays a numeric value that can change over time.
 * Uses the {@link useEventedValue} hook to subscribe to value changes.
 */
export const GameEventedValue: FC<{
	value: EventedValue<Type>;
	transform?: (value: Type) => React.ReactNode | Type;
}> = ({ value, transform }) => {
	const currentValue = useEventedValue(value, transform);
	return <>{currentValue}</>;
};
