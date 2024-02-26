import React, { FunctionComponent } from 'react';

import { useGameContext } from '../context/GameContext.tsx';
import { MapTerrain } from '../map/MapTerrain.tsx';
import { MapViewport } from '../map/MapViewport.tsx';

export const GameMap: FunctionComponent = () => {
	const game = useGameContext();
	return (
		<div className="game-viewport">
			<MapViewport>
				<MapTerrain terrain={game.terrain} entities={game.entities} />
			</MapViewport>
		</div>
	);
};
