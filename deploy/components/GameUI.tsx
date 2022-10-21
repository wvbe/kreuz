import { FunctionComponent } from 'react';
import { TerrainUI } from './TerrainUI.tsx';
import { AlephDriver } from '../utils/AlephDriver.ts';
import { EntityList } from './EntityList.tsx';
import { Clock } from './Clock.tsx';
import { EventLog } from './EventLog.tsx';
import { Game } from '@lib';
import { MaterialList } from './MaterialList.tsx';
import { BlueprintList } from './BlueprintList.tsx';
import { PanZoom } from './PanZoom.tsx';

export const GameUI: FunctionComponent<{ game: Game }> = ({ game }) => {
	return (
		<div className="game-ui">
			<div className="game-ui__column--left">
				<div>
					<Clock game={game} />
				</div>
				<div className="game-ui__viewport">
					<PanZoom>
						<TerrainUI terrain={game.terrain} entities={game.entities} />
					</PanZoom>
				</div>
				<div>
					<EntityList entities={game.entities} />
				</div>
			</div>
			<div className="game-ui__column--right">
				<EventLog game={game} />
				<MaterialList />
				<BlueprintList />
			</div>
		</div>
	);
};
