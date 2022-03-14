import React, { FunctionComponent, useMemo } from 'react';
import { Game } from '../Game';
import { GameC } from '../GameC';
import { GameContext } from '../hooks/game';
import { SeedI } from '../types';
import GlobalStyles from '../ui/GlobalStyles';
import { generateDualMeshTerrain } from './generators/generateDualMeshTerrain';
import { generateEntities } from './generators/generateEntities';

// @TODO restore images some time
// import nebulaTexture from './textures/water-2.png';

function generateEverything(seed: SeedI = String(Date.now())) {
	const size = 20;
	const density = 1;
	const terrain = generateDualMeshTerrain(seed, size, density);
	const entities = generateEntities(seed, terrain);
	const game = new Game(seed, terrain, entities);
	return game;
}

const Demo: FunctionComponent<{ seed?: SeedI }> = ({ seed }) => {
	const game = useMemo(() => generateEverything(seed), [seed]);
	return (
		<React.StrictMode>
			<GlobalStyles />

			<GameContext.Provider value={game}>
				<GameC game={game} />
			</GameContext.Provider>
		</React.StrictMode>
	);
};

export default Demo;
