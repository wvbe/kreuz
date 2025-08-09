import { useCallback, type FunctionComponent } from 'react';
import { excavatorButton, fillButton, harvestButton } from '../game/assets/actions/landscaping';
import { DriverI } from '../game/core/drivers/types';
import Game from '../game/core/Game';
import { Contexts } from './Contexts';
import { GameActionButton } from './game/GameActionButton';
import { GameClock, GameSpeedControls } from './game/GameClock';
import { GameContextMenuHost } from './game/GameContextMenu';
import { GameEventedValue } from './game/GameEventedValue';
import { GameMapSelectionOverlays } from './game/GameMapSelectionOverlays';
import { GameSelectedEntity } from './game/GameSelectedEntity';
import { GameSelectedTerrain } from './game/GameSelectedTerrain';
import { ButtonBar } from './hud/atoms/ButtonBar';
import './hud/variables.css';
import styles from './Ui.module.css';
import { Viewport } from './util/Viewport';

const ONE_FULL_ROTATION_OF_FASTEST = 180; // 30 minutes
const ONE_FULL_ROTATION_OF_MIDDLE = 10800; // 18 hours
const ONE_FULL_ROTATION_OF_SLOWEST = 129600; // 1 day

export const Ui: FunctionComponent<{
	driver: DriverI;
	game: Game;
}> = ({ driver, game }) => {
	const transformGameTimeToDays = useCallback((time: number) => {
		// Return a string like "Day 2, second hour"
		const days = Math.floor(time / ONE_FULL_ROTATION_OF_SLOWEST);
		const hours = Math.floor(
			(time % ONE_FULL_ROTATION_OF_SLOWEST) / ONE_FULL_ROTATION_OF_MIDDLE,
		);
		const minutes = Math.floor(
			(time % ONE_FULL_ROTATION_OF_MIDDLE) / ONE_FULL_ROTATION_OF_FASTEST,
		);
		return `${days}d ${hours}h ${minutes}m`;
	}, []);

	return (
		<Contexts driver={driver} game={game}>
			<div className={styles.gameClockContainer}>
				<GameEventedValue eventedValue={game.time} transform={transformGameTimeToDays} />
				<GameClock />
			</div>
			<div className={styles.gameActionBar}>
				<GameSelectedEntity />
				<ButtonBar stretchy>
					<GameActionButton options={excavatorButton} />
					<GameActionButton options={fillButton} />
					<GameActionButton options={harvestButton} />
				</ButtonBar>
				<ButtonBar>
					<GameSpeedControls />
				</ButtonBar>
			</div>
			<Viewport>
				<GameContextMenuHost>
					<GameSelectedTerrain />
					<GameMapSelectionOverlays />
				</GameContextMenuHost>
			</Viewport>
		</Contexts>
	);
};
