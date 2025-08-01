import { FC, useCallback, useState } from 'react';
import { useDriverContext } from '../contexts/DriverContext';
import { useGameContext } from '../contexts/GameContext';
import { useEventedValue } from '../hooks/useEventedValue';

import { Button } from '../hud/atoms/Button';
import { FancyClock } from '../hud/atoms/FancyClock';
import { Panel } from '../hud/atoms/Panel';
import { DefinitionTable } from '../util/DefinitionTable';
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
			<div style={{ flex: 0 }}>
				<FancyClock
					time={
						// t+1 tick on fancy clock is one second.
						// t+1 tick on game is however much time it takes to walk from one tile to another
						// so the arbitrary number here decides how long that is
						time / 300
					}
				/>
			</div>
			<div style={{ flex: 1 }}>
				<DefinitionTable
					data={[
						{ key: 'Status', value: isAnimating ? 'Running' : 'Paused' },
						{ key: 'Speed', value: gameSpeed },
						{
							key: 'Controls',
							value: (
								<>
									<Button onClick={slower} icon={'🐢'} layout='tile'></Button>
									<Button onClick={faster} icon={'🐇'} layout='tile'></Button>
								</>
							),
						},
					]}
				/>
			</div>
		</Panel>
	);
};
