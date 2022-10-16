import { FunctionComponent } from 'react';
import { TerrainUI } from './TerrainUI.tsx';
import { AlephDriver } from '../utils/AlephDriver.ts';
import { EntityList } from './EntityList.tsx';
import { Clock } from './Clock.tsx';

export const GameUI: FunctionComponent<{ driver: AlephDriver }> = ({ driver }) => {
	return (
		<div>
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
	);
};
