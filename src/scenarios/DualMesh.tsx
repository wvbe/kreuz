import { css, Global } from '@emotion/react';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { Game } from '../Game';
import { GameC } from '../GameC';
import { GameContext } from '../hooks/game';
import { generateDualMeshTerrain } from './generators/generateDualMeshTerrain';
import { generateEntities } from './generators/generateEntities';

// @TODO restore images some time
// import nebulaTexture from './textures/water-2.png';

const globalStyleRules = css`
	p {
		margin: 0;
	}
`;

function generateEverything(seed: string = String(Date.now())) {
	const size = 24;
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

function GameRoute() {
	const gameApplicationProps = useMemo(() => {
		return generateEverything();
	}, []);
	useEffect(() => {
		gameApplicationProps.game.play();
		return () => gameApplicationProps.game.destroy();
	}, [gameApplicationProps.game]);
	return (
		<GameContext.Provider value={gameApplicationProps.game}>
			<GameC {...gameApplicationProps} />
		</GameContext.Provider>
	);
}

const Demo: FunctionComponent = () => (
	<React.StrictMode>
		<Global styles={globalStyleRules} />
		<GameRoute />
	</React.StrictMode>
);

export default Demo;
