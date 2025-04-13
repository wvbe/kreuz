import React, { useEffect, useState } from 'react';
import './Clock.css';

interface ClockProps {
	size?: number;
	showSeconds?: boolean;
}

export const Clock: React.FC<ClockProps> = ({ size = 200, showSeconds = true }) => {
	const [time, setTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const hours = time.getHours() % 12;
	const minutes = time.getMinutes();
	const seconds = time.getSeconds();

	const hourDegrees = hours * 30 + minutes * 0.5;
	const minuteDegrees = minutes * 6;
	const secondDegrees = seconds * 6;

	return (
		<div className='clock' style={{ width: size, height: size }}>
			<div className='clock-face'>
				{Array.from({ length: 12 }).map((_, i) => (
					<div
						key={i}
						className='number'
						style={{
							transform: `rotate(${i * 30}deg) translateY(-${
								size / 2 - 20
							}px) rotate(-${i * 30}deg)`,
						}}
					>
						{i + 1}
					</div>
				))}
				<div
					className='hand hour-hand'
					style={{ transform: `rotate(${hourDegrees}deg)` }}
				/>
				<div
					className='hand minute-hand'
					style={{ transform: `rotate(${minuteDegrees}deg)` }}
				/>
				{showSeconds && (
					<div
						className='hand second-hand'
						style={{ transform: `rotate(${secondDegrees}deg)` }}
					/>
				)}
				<div className='center-dot' />
			</div>
		</div>
	);
};
