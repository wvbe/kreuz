import { Game, type DriverI } from '@lib';
import React, { FunctionComponent, useCallback } from 'react';
import { useEventedValue } from '../hooks/useEventedValue.ts';
import { FillBar } from './atoms/FillBar.tsx';

export const Clock: FunctionComponent<{ game: Game; driver: DriverI }> = ({ game, driver }) => {
	const time = useEventedValue(game.time);
	const isAnimating = useEventedValue(driver.$$animating);
	const pause = useCallback(() => {
		driver.stop();
	}, []);
	const resume = useCallback(() => {
		driver.start();
	}, []);
	return (
		<div>
			<button onClick={pause} disabled={!isAnimating}>
				Pause
			</button>
			<button onClick={resume} disabled={isAnimating}>
				Resume
			</button>
			<FillBar
				ratio={(time % 1000) / 1000}
				label={`${Math.ceil(time / 1000)} hours since start of the game`}
			/>

			{game.time.getNextEventAbsoluteTime() === Infinity ? (
				<p>No events scheduled for the future</p>
			) : null}
		</div>
	);
};
