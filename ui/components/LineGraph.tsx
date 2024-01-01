import React, { FC, useRef, useEffect, useState } from 'react';

export const LineGraph: FC<{ subscriptions: (() => number)[] }> = ({ subscriptions }) => {
	const values = useRef<number[][]>([]);
	const [minMax, setMinMax] = useState<[number, number]>([0, 0]);

	useEffect(() => {
		values.current = subscriptions.map(() => []);
		const interval = setInterval(() => {
			subscriptions.forEach((sub, index) => {
				values.current[index].push(sub());
				if (values.current[index].length > 100) {
					values.current[index].shift();
				}
			});
			let min = Infinity,
				max = -Infinity;
			values.current.forEach((vals) =>
				vals.forEach((num) => {
					if (num < min) {
						min = num;
					}
					if (num > max) {
						max = num;
					}
				}),
			);
			setMinMax([min, max]);
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	}, []);

	if (minMax[0] === 0 && minMax[1] === 0) {
		return null;
	}

	const range = minMax[1] - minMax[0];

	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
			{values.current.map((vals, index) => (
				<polyline
					points={vals.map((y, x) => `${x},${100 - ((y - minMax[0]) / range) * 100}`).join(' ')}
					stroke={'black'}
					fill="none"
				/>
			))}
		</svg>
	);
};
