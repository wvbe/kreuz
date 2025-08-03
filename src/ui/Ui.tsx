import { type FunctionComponent } from 'react';
import { DriverI } from '../game/core/drivers/types';
import Game from '../game/core/Game';
import { excavatorButton } from './actions/landfill';
import { Contexts } from './Contexts';
import { GameActionBar } from './game/GameActionBar';
import { GameClock } from './game/GameClock';
import { GameContextMenuHost } from './game/GameContextMenu';
import { GameSelectedEntity } from './game/GameSelectedEntity';
import { GameSelectedTerrain } from './game/GameSelectedTerrain';
import './hud/variables.css';
import { Viewport } from './util/Viewport';
import { GameActionButton } from './game/GameActionButton';

export const Ui: FunctionComponent<{
	driver: DriverI;
	game: Game;
}> = ({ driver, game }) => {
	return (
		<Contexts driver={driver} game={game}>
			<GameClock />
			<GameActionBar>
				<GameActionButton options={excavatorButton} />
			</GameActionBar>
			<GameSelectedEntity />
			<Viewport>
				<GameContextMenuHost>
					<GameSelectedTerrain />
				</GameContextMenuHost>
			</Viewport>
		</Contexts>
	);
};
