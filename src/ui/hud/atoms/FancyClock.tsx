import { useMemo, type FunctionComponent } from 'react';
import styles from './FancyClock.module.css';

/**
 * Props for the AnalogClock component
 */
interface AnalogClockProps {
	/** Current time value (0-1000, where 0 is midnight and 1000 is one hour later) */
	time: number;
	style?:
		| 'skeuomorphic'
		| 'flat-design'
		| 'material-design'
		| 'neumorphism'
		| 'glassmorphism'
		| 'claymorphism'
		| 'brutalism'
		| 'minimalism';
}

/**
 * An analog clock component that displays game time and allows controlling time speed
 * @param props - Component props
 * @returns React component
 */
export const FancyClock: FunctionComponent<AnalogClockProps> = ({
	time,
	style = 'skeuomorphic',
}) => {
	// Convert time (0-1000) to degrees (0-360)
	const t = time / 6; // / 60;
	const secondDegrees = t * 360;
	const minuteDegrees = (secondDegrees / 60) * 1;
	const hourDegrees = (minuteDegrees / 60) * 5;

	const hourMarks = useMemo(
		() =>
			Array.from({ length: 12 }).map((_nothing, i) => (
				<div
					key={i}
					className={styles['hour-mark']}
					style={{ transform: `rotate(${i * 30}deg)` }}
				></div>
			)),
		[],
	);
	const hourNumbers = useMemo(
		() =>
			Array.from({ length: 12 }).map((_nothing, i) => {
				const angle = i * 30;
				const radius = 112;
				const x = 120 + radius * Math.sin((angle * Math.PI) / 180);
				const y = 120 - radius * Math.cos((angle * Math.PI) / 180);
				return (
					<div
						className={styles['hour-number']}
						key={i}
						style={{
							left: `calc(${x}px * var(--zoom-factor))`,
							top: `calc(${y}px * var(--zoom-factor))`,
						}}
					>
						{i === 0 ? '12' : i}
					</div>
				);
			}),
		[],
	);
	return (
		<div className={styles[style]}>
			<div className={styles['clock-container']}>
				<div className={styles['clock-bezel']}></div>
				<div className={styles['clock-face']}>{hourNumbers}</div>
				<div className={styles['clock-reflection']}></div>
				<div className={styles['hour-marks']} id='skeuomorphic-hour-marks'>
					{hourMarks}
				</div>
				<div
					className={`${styles['hour-hand']} ${styles.hand}`}
					id='skeuomorphic-hour-hand'
					style={{ transform: `rotate(${hourDegrees}deg)` }}
				></div>
				<div
					className={`${styles['minute-hand']} ${styles.hand}`}
					id='skeuomorphic-minute-hand'
					style={{ transform: `rotate(${minuteDegrees}deg)` }}
				></div>
				<div
					className={`${styles['second-hand']} ${styles.hand}`}
					id='skeuomorphic-second-hand'
					style={{ transform: `rotate(${secondDegrees}deg)` }}
				></div>
				<div className={styles['clock-center']}></div>
			</div>
		</div>
	);
};
