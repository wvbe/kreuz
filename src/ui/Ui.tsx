import { type FunctionComponent } from 'react';
import { DriverI } from '../game/core/drivers/types';
import Game from '../game/core/Game';
import { Contexts } from './Contexts';
import { GameActionBar } from './game/GameActionBar';
import { GameActionButton } from './game/GameActionButton';
import { GameClock } from './game/GameClock';
import { GameContextMenuHost } from './game/GameContextMenu';
import { GameMapSelectionOverlays } from './game/GameMapSelectionOverlays';
import { GameSelectedEntity } from './game/GameSelectedEntity';
import { GameSelectedTerrain } from './game/GameSelectedTerrain';
import './hud/variables.css';
import { Viewport } from './util/Viewport';
import { excavatorButton, fillButton } from './actions/landscaping';

export const Ui: FunctionComponent<{
	driver: DriverI;
	game: Game;
}> = ({ driver, game }) => {
	return (
		<Contexts driver={driver} game={game}>
			<GameClock />
			<GameActionBar>
				<GameActionButton options={excavatorButton} />
				<GameActionButton options={fillButton} />
			</GameActionBar>
			<GameSelectedEntity />
			<Viewport>
				<GameContextMenuHost>
					<GameSelectedTerrain />
					<GameMapSelectionOverlays />
				</GameContextMenuHost>
			</Viewport>
		</Contexts>
	);
};
