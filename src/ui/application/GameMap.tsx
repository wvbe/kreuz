import React, { FunctionComponent } from 'react';

import { useGameContext } from '../context/GameContext';
import { MapTerrain } from '../map/MapTerrain';
import { MapViewport } from '../map/MapViewport';

export const GameMap: FunctionComponent = () => {
	const game = useGameContext();
	return (
		<div className='game-viewport'>
			<MapViewport>
				<MapTerrain terrain={game.terrain} entities={game.entities.living} />
			</MapViewport>
		</div>
	);
};
