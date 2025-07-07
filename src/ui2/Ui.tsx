import React, { useState, type FunctionComponent } from 'react';
import { DriverI } from '../lib/level-1/drivers/types';
import Game from '../lib/level-1/Game';
import { PROMPT_CONSTRUCTION_JOB } from '../lib/level-2/commands/ConstructionJob';
import { registerUiForPrompt } from '../ui/modals/ModalHost';
import { EntityConstructionModal } from '../ui/prompts/EntityConstructionModal';
import { Contexts } from './Contexts';
import { GameActionBar } from './game/GameActionBar';
import { GameClock } from './game/GameClock';
import { GameContextMenuHost } from './game/GameContextMenu';
import { GameMap } from './game/GameMap';
import { GameSelectedEntity } from './game/GameSelectedEntity';
import { TilePaintMode } from './game/hooks/useTilePaintMode';
import './hud/variables.css';
import { PanZoomable } from './util/PanZoomable';
registerUiForPrompt(PROMPT_CONSTRUCTION_JOB, EntityConstructionModal);

export const Ui: FunctionComponent<{
	driver: DriverI;
	game: Game;
}> = ({ driver, game }) => {
	// Track the currently selected tool (paint mode)
	const [tilePaintMode, setTilePaintMode] = useState<TilePaintMode | null>(null);

	return (
		<Contexts driver={driver} game={game}>
			<GameClock />
			<GameActionBar tilePaintMode={tilePaintMode} setTilePaintMode={setTilePaintMode} />
			<GameSelectedEntity />
			<PanZoomable>
				<GameContextMenuHost>
					<GameMap tilePaintMode={tilePaintMode} />
				</GameContextMenuHost>
			</PanZoomable>
		</Contexts>
	);
};
