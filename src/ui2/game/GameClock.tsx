import React, { FC, useCallback, useState } from 'react';
import { useEventedValue } from '../../ui/hooks/useEventedValue';
import { useDriverContext } from '../contexts/DriverContext';
import { useGameContext } from '../contexts/GameContext';

import { FancyClock } from '../hud/atoms/FancyClock';
import { Panel } from '../hud/atoms/Panel';
import './game-ui.css';

/**
 * A component that maps the game time to a presentational clock component.
 *
 * This component uses the {@link FancyClock} presentational component to display the current game time.
 */
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

	return (
		<Panel data-component='GameClock'>
			<FancyClock
				time={
					// t+1 tick on fancy clock is one second.
					// t+1 tick on game is however much time it takes to walk from one tile to another
					// so the arbitrary number here decides how long that is
					time / 300
				}
			/>
			<aside>
				<button onClick={slower}>🐢</button>
				<button onClick={faster}>🐇</button>
			</aside>
			<p>Speed: {gameSpeed}</p>
			{isAnimating ? <p>Animating</p> : <p>Paused</p>}
		</Panel>
	);
};
