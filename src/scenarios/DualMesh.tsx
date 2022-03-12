import React, { FunctionComponent, useEffect, useMemo } from 'react';
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
	const size = 40;
	const density = 1;
	const terrain = generateDualMeshTerrain(seed, size, density);
	const entities = generateEntities(seed, terrain);
	const game = new Game(seed, terrain, entities);
	const initialViewportCenter = game.terrain.getTileClosestToXy(
		Math.floor(size / 2),
		Math.floor(size / 2)
	);
	return {
		game,
		initialViewportCenter
	};
}

const GameRoute: FunctionComponent<{ asIsometric: boolean; seed?: SeedI }> = ({
	asIsometric,
	seed
}) => {
	const gameApplicationProps = useMemo(() => {
		return generateEverything(seed);
	}, [seed]);
	useEffect(() => {
		gameApplicationProps.game.play();
		return () => gameApplicationProps.game.destroy();
	}, [gameApplicationProps.game]);
	return (
		<GameContext.Provider value={gameApplicationProps.game}>
			<GameC {...gameApplicationProps} asIsometric={asIsometric} />
		</GameContext.Provider>
	);
};

const Demo: FunctionComponent<{ asIsometric: boolean; seed?: SeedI }> = ({ asIsometric, seed }) => (
	<React.StrictMode>
		<GlobalStyles />
		<GameRoute asIsometric={asIsometric} seed={seed} />
	</React.StrictMode>
);

export default Demo;
