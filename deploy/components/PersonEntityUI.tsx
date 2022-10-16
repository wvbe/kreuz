import { FunctionComponent, useEffect } from 'react';
import { type PersonEntity } from '@lib';
import { useEventedValue } from '../hooks/useEventedValue.ts';

export const PersonEntityUI: FunctionComponent<{ person: PersonEntity }> = ({ person }) => {
	const zoom = 10;
	const { x, y } = useEventedValue(person.$$location);
	return <circle cx={x * zoom} cy={y * zoom} r="1" style={{ transition: 'cx 1s, cy 1s' }} />;
};
