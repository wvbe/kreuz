import { FC } from 'react';
import { EventedValue } from '../../game/core/events/EventedValue';
import { useEventedValue } from '../hooks/useEventedValue';
import styles from './Gauge.module.css';

export const Gauge: FC<{
	eventedValue: EventedValue<number>;
	max?: number;
	vertical?: boolean;
	label?: string;
}> = ({ eventedValue, max = 1, vertical = false, label }) => {
	const value = useEventedValue<number>(eventedValue);
	return (
		<div className={`${styles.container} ${vertical ? styles.vertical : ''}`}>
			<div className={styles.gauge}>
				<div
					className={styles.gaugeInner}
					style={{ [vertical ? 'height' : 'width']: `${(value / max) * 100}%` }}
				/>
			</div>
			{label ? <div className={styles.label}>{label}</div> : null}
		</div>
	);
};
