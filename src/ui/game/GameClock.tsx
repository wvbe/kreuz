import { FC, useCallback } from 'react';
import { useDriverContext } from '../contexts/DriverContext';
import { useGameContext } from '../contexts/GameContext';
import { useEventedValue } from '../hooks/useEventedValue';

import { Button } from '../hud/atoms/Button';
import { FancyClock } from '../hud/atoms/FancyClock';

/**
 * A component that maps the game time to a presentational clock component.
 *
 * This component uses the {@link FancyClock} presentational component to display the current game time.
 */
export const GameClock: FC = () => {
	const game = useGameContext();
	const time = useEventedValue(game.time);

	// t+1 tick on fancy clock is one second.
	// t+1000 tick on game is however much time it takes to walk from one tile to another
	// so the arbitrary number here decides how long that is
	return <FancyClock time={time / 30} />;
};

/**
 * A component that maps the game time to a presentational clock component.
 *
 * This component uses the {@link FancyClock} presentational component to display the current game time.
 */
export const GameSpeedControls: FC = () => {
	const driver = useDriverContext();
	const game = useGameContext();
	const isAnimating = useEventedValue(driver.$$animating);
	const gameSpeed = useEventedValue(game.time.speed);
	const faster = useCallback(async () => {
		game.time.speed.set(game.time.speed.get() * 2);
	}, []);

	const slower = useCallback(async () => {
		game.time.speed.set(game.time.speed.get() / 2);
	}, []);

	const onPauseResume = useCallback(async () => {
		if (isAnimating) {
			await driver.stop();
		} else {
			await driver.start();
		}
	}, [isAnimating]);

	return (
		<>
			<Button onClick={slower} icon={'🐢'} layout='tile' disabled={gameSpeed <= 1}>
				Slowe
			</Button>
			<Button
				onClick={onPauseResume}
				icon={isAnimating ? '▶️' : '⏸️'}
				layout='tile'
				active={!isAnimating}
			>
				{gameSpeed}x
			</Button>
			<Button onClick={faster} icon={'🐇'} layout='tile' disabled={gameSpeed >= 32}>
				Swifte
			</Button>
		</>
	);
};
