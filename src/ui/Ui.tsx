import { useState, type FunctionComponent } from 'react';
import { DriverI } from '../game/core/drivers/types';
import Game from '../game/core/Game';
import { Contexts } from './Contexts';
import { GameActionBar } from './game/GameActionBar';
import { GameClock } from './game/GameClock';
import { GameContextMenuHost } from './game/GameContextMenu';
import { GameSelectedEntity } from './game/GameSelectedEntity';
import { GameTerrain } from './game/GameTerrain';
import { TilePaintMode } from './game/hooks/useTilePaintMode';
import './hud/variables.css';
import { PanZoomable } from './util/PanZoomable';

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
					<GameTerrain tilePaintMode={tilePaintMode} terrain={game.terrain} />
				</GameContextMenuHost>
			</PanZoomable>
		</Contexts>
	);
};
