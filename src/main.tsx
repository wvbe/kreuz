import { FunctionComponent, default as React, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { caveScene } from './scenarios/cave';
import { BrowserDriver } from './ui/BrowserDriver';
import { GameInterface } from './ui/GameInterface';
import { useGeneratedGame } from './ui/hooks/useGeneratedGame';
import './ui/mod.css';

const driver = new BrowserDriver();

const App: FunctionComponent = () => {
	const game = useGeneratedGame(caveScene, driver);
	if (!game) {
		return <p className='panel please-wait'>Please wait…</p>;
	}

	return <GameInterface game={game} driver={driver} />;
};
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
