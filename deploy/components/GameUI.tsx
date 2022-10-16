import { FunctionComponent } from 'react';
import { TerrainUI } from './TerrainUI.tsx';
import { AlephDriver } from '../utils/AlephDriver.ts';
import { EntityList } from './EntityList.tsx';
import { Clock } from './Clock.tsx';
import { EventLog } from './EventLog.tsx';

export const GameUI: FunctionComponent<{ driver: AlephDriver }> = ({ driver }) => {
	return (
		<div className="game-ui">
			<div className="game-ui__column--left">
				<div>
					<Clock game={driver.game} />
				</div>
				<div className="gameui--layer">
					<TerrainUI terrain={driver.game.terrain} entities={driver.game.entities} />
				</div>
				<div className="gameui--layer">
					<EntityList entities={driver.game.entities} />
				</div>
			</div>
			<div className="game-ui__column--right">
				<EventLog game={driver.game} />
			</div>
		</div>
	);
};
