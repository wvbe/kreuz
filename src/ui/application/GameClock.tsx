import React, { FunctionComponent, useCallback, useState } from 'react';
import { timeToString } from 'src/lib/level-1/time/timeToString.js';
import { FillBar } from '../components/atoms/FillBar';
import { useDriverContext } from '../context/DriverContext';
import { useGameContext } from '../context/GameContext';
import { useEventedValue } from '../hooks/useEventedValue';

export const GameClock: FunctionComponent = () => {
	const driver = useDriverContext();
	const game = useGameContext();
	const time = useEventedValue(game.time);
	const [gameSpeed, setGameSpeed] = useState(game.time.speed.get());
	const isAnimating = useEventedValue(driver.$$animating);
	const pause = useCallback(async () => {
		await driver.stop();
	}, []);
	const resume = useCallback(async () => {
		await driver.start();
	}, []);

	const onGameSpeedChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((event) => {
		const timeDilation = parseFloat(event.target.value);
		if (isNaN(timeDilation) || timeDilation < 0) {
			return;
		}
		game.time.speed.set(timeDilation);
		setGameSpeed(timeDilation);
	}, []);

	return (
		<div className='panel game-ui__clock' style={{ padding: '3px' }}>
			<button onClick={pause} disabled={!isAnimating}>
				Pause
			</button>
			<button onClick={resume} disabled={isAnimating}>
				Resume
			</button>
			<input type='number' size={3} value={gameSpeed} onChange={onGameSpeedChange} />
			<FillBar
				ratio={(time % (1000 * 24)) / (1000 * 24)}
				label={`${timeToString(time)} hours since start of the game`}
			/>

			{game.time.getNextEventAbsoluteTime() === Infinity ? (
				<p>No events scheduled for the future</p>
			) : null}
		</div>
	);
};
