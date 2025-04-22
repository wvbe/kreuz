import React, { type FunctionComponent } from 'react';
import { DriverI } from '../lib/level-1/drivers/types';
import Game from '../lib/level-1/Game';
import { PROMPT_CONSTRUCTION_JOB } from '../lib/level-2/commands/constructEntity';
import { registerUiForPrompt } from '../ui/modals/ModalHost';
import { EntityConstructionModal } from '../ui/prompts/EntityConstructionModal';
import { Contexts } from './Contexts';
import { GameClock } from './game/GameClock';
import { GameContextMenuHost } from './game/GameContextMenu';
import { GameMap } from './game/GameMap';
import { GameSelectedEntity } from './game/GameSelectedEntity';
import { PanZoomable } from './util/PanZoomable';

registerUiForPrompt(PROMPT_CONSTRUCTION_JOB, EntityConstructionModal);

export const Ui: FunctionComponent<{
	driver: DriverI;
	game: Game;
}> = ({ driver, game }) => {
	return (
		<Contexts driver={driver} game={game}>
			<GameClock />
			<GameSelectedEntity />
			<PanZoomable>
				<GameContextMenuHost>
					<GameMap />
				</GameContextMenuHost>
			</PanZoomable>
		</Contexts>
	);
};
