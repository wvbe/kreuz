import React, { FunctionComponent, useCallback } from 'react';
import { MapTerrain } from '../map/MapTerrain.tsx';
import { EntityList } from './EntityList.tsx';
import { Clock } from './Clock.tsx';
import { type DriverI, type Game } from '@lib';
import { MaterialList } from './MaterialList.tsx';
import { BlueprintList } from './BlueprintList.tsx';
import { MapViewport } from '../map/MapViewport.tsx';
import { SelectedEntityDetails } from './EntityDetails.tsx';
import { ProductionList } from './ProductionList.tsx';

export const GameUI: FunctionComponent<{ game: Game; driver: DriverI }> = ({ game, driver }) => {
	return (
		<>
			<div className="game-ui">
				<div className="game-ui__clock">
					<Clock game={game} driver={driver} />
				</div>
				<div className="game-ui__info">
					<SelectedEntityDetails />
				</div>
				<div className="game-ui__workspace">
					<EntityList
						label="People"
						entities={game.entities}
						filter={useCallback((e) => e.type === 'person', [])}
					/>
					<EntityList
						label="Factories"
						entities={game.entities}
						filter={useCallback((e) => e.type === 'factory', [])}
					/>
					<EntityList
						label="Markets"
						entities={game.entities}
						filter={useCallback((e) => e.type === 'market-stall', [])}
					/>
					<ProductionList game={game} />
					<MaterialList />
					<BlueprintList />
				</div>
			</div>
			<div className="game-viewport">
				<MapViewport>
					<div className="background" />
					<MapTerrain terrain={game.terrain} entities={game.entities} />
				</MapViewport>
			</div>
		</>
	);
};
