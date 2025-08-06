import { FC } from 'react';
import { EventedValue } from '../../game/core/events/EventedValue';
import { useEventedValue } from '../hooks/useEventedValue';
import styles from './Gauge.module.css';

export const Gauge: FC<{ eventedValue: EventedValue<number>; max?: number }> = ({
	eventedValue,
	max = 1,
}) => {
	const value = useEventedValue<number>(eventedValue);
	return (
		<div className={styles.gauge}>
			<div className={styles.gaugeInner} style={{ width: `${(value / max) * 100}%` }} />
		</div>
	); // TODO: implement
};
