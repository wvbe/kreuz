import { FC } from 'react';
import { EventedValue } from '../../game/core/events/EventedValue';
import { useEventedValue } from '../hooks/useEventedValue';
import styles from './Gauge.module.css';

export const Gauge: FC<{
	eventedValue: EventedValue<number>;
	max?: number;
	vertical?: boolean;
}> = ({ eventedValue, max = 1, vertical = false }) => {
	const value = useEventedValue<number>(eventedValue);
	return (
		<div className={`${styles.gauge} ${vertical ? styles.vertical : ''}`}>
			<div
				className={styles.gaugeInner}
				style={{ [vertical ? 'height' : 'width']: `${(value / max) * 100}%` }}
			/>
		</div>
	);
};
