import { FunctionComponent } from 'react';
import { TerrainUI } from './TerrainUI.tsx';
import { AlephDriver } from '../utils/AlephDriver.ts';
import { EntityList } from './EntityList.tsx';
import { Clock } from './Clock.tsx';
import { EventLog } from './EventLog.tsx';
import { Game } from '@lib';

export const GameUI: FunctionComponent<{ game: Game }> = ({ game }) => {
	return (
		<div className="game-ui">
			<div className="game-ui__column--left">
				<div>
					<Clock game={game} />
				</div>
				<div className="gameui--layer">
					<TerrainUI terrain={game.terrain} entities={game.entities} />
				</div>
				<div className="gameui--layer">
					<EntityList entities={game.entities} />
				</div>
			</div>
			<div className="game-ui__column--right">
				<EventLog game={game} />
			</div>
		</div>
	);
};
