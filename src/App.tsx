import React, { useEffect, useMemo } from 'react';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';
import { Scene } from './classes/Scene';
import DemoCubes from './demos/demo.cubes';
import { Game, GameContext } from './Game';
import { generateEntities } from './generators/hello-world';
import { generateRandom as generateTerrain } from './terrain/DualMeshTerrain';
import { GameApplication } from './ui/GameApplication';

function generateEverything(seed: string = String(Date.now())) {
	const size = 48;
	const density = 1;
	let game: Game;
	if ((window as any).game) {
		game = (window as any).game;
	} else {
		const terrain = generateTerrain(seed, size, density);
		const entities = generateEntities(seed, terrain);
		const scene = new Scene(seed, terrain, entities);
		game = new Game(scene);
		(window as any).game = game;
	}
	const initialViewportCenter = game.scene.terrain.getClosestToXy(
		Math.floor(size / 2),
		Math.floor(size / 2)
	);
	return {
		game,
		initialViewportCenter
	};
}

function GameRoute() {
	const gameApplicationProps = useMemo(() => generateEverything(), []);
	useEffect(() => gameApplicationProps.game.scene.play(), [gameApplicationProps.game.scene]);
	return (
		<GameContext.Provider value={gameApplicationProps.game}>
			<GameApplication {...gameApplicationProps} />
		</GameContext.Provider>
	);
}

function TestRoute() {
	return (
		<>
			<ul>
				<li>
					<Link to="/tests">Tests</Link>
				</li>
			</ul>
			<Route exact path="/tests" component={DemoCubes} />
		</>
	);
}

function App() {
	return (
		<Switch>
			<Route exact path="/" component={GameRoute} />
			<Route component={TestRoute} />
		</Switch>
	);
}

export default App;
