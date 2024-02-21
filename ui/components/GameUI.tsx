import React, { FunctionComponent, useCallback } from 'react';

import { useGameContext } from '../context/GameContext.tsx';
import { SelectedEntityDetails } from '../entities/EntityDetails.tsx';
import { EntityList } from '../entities/EntityList.tsx';
import { MaterialList } from '../inventory/MaterialList.tsx';
import { MapTerrain } from '../map/MapTerrain.tsx';
import { MapViewport } from '../map/MapViewport.tsx';
import { BlueprintList } from './BlueprintList.tsx';
import { Clock } from './Clock.tsx';
import { ProductionList } from './ProductionList.tsx';
import { SelectedEntityContextProvider } from '../hooks/useSelectedEntity.tsx';

export const GameUI: FunctionComponent = () => {
	const game = useGameContext();
	return (
		<SelectedEntityContextProvider>
			<div className="game-ui">
				<div className="game-ui__clock">
					<Clock />
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
		</SelectedEntityContextProvider>
	);
};
