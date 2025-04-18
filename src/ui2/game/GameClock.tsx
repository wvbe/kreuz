import React, { FC, useCallback, useState } from 'react';
import { useEventedValue } from '../../ui/hooks/useEventedValue';
import { useDriverContext } from '../contexts/DriverContext';
import { useGameContext } from '../contexts/GameContext';

import { FancyClock } from '../clock/FancyClock';
import './game-ui.css';

export const GameClock: FC = () => {
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
	const faster = useCallback(async () => {
		setGameSpeed((current) => {
			game.time.speed.set(current * 2);
			return current * 2;
		});
	}, []);
	const slower = useCallback(async () => {
		setGameSpeed((current) => {
			game.time.speed.set(Math.ceil(current / 2));
			return Math.ceil(current / 2);
		});
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
		<div data-component='GameClock'>
			<FancyClock
				time={
					// t+1 tick on fancy clock is one second.
					// t+1 tick on game is however much time it takes to walk from one tile to another
					// so the arbitrary number here decides how long that is
					time / 300
				}
				onTimeSpeedChange={() => {}}
			/>
			<aside>
				<button onClick={slower}>🐢</button>
				<button onClick={faster}>🐇</button>
			</aside>
			<p>Speed: {gameSpeed}</p>
			{isAnimating ? <p>Animating</p> : <p>Paused</p>}
		</div>
	);
};
