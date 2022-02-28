import { css, Global } from '@emotion/react';
import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { Scene } from '../classes/Scene';
import { Game } from '../Game';
import { generateEntities } from './generators/generateEntities';
import { GameContext } from '../hooks/game';
import { generateDualMeshTerrain } from './generators/generateDualMeshTerrain';
import { GameApplication } from '../ui/GameApplication';

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
	const scene = new Scene(seed, terrain, entities);
	const game = new Game(scene);
	const initialViewportCenter = game.scene.terrain.getTileClosestToXy(
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
		gameApplicationProps.game.scene.play();
		return () => gameApplicationProps.game.destroy();
	}, [gameApplicationProps.game]);
	return (
		<GameContext.Provider value={gameApplicationProps.game}>
			<GameApplication {...gameApplicationProps} />
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
